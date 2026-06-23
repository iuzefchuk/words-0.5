import type { AppSchedulerGateway } from '@/app/types/gateways.ts';

export default class BrowserSchedulerGateway {
  static async padTo<T>(minimumMs: number, callback: () => Promise<T> | T): Promise<T> {
    const startTime = this.getCurrentTime();
    const result = await callback();
    const elapsed = this.getCurrentTime() - startTime;
    const delay = minimumMs - elapsed;
    if (delay > 0) await this.wait(delay);
    return result;
  }

  static yield(): Promise<void> {
    const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
    if (scheduler?.yield !== undefined) return scheduler.yield();
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (): void => {
        channel.port1.close();
        resolve();
      };
      channel.port2.postMessage(undefined);
    });
  }

  private static getCurrentTime(): number {
    return Date.now();
  }

  private static wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

BrowserSchedulerGateway satisfies AppSchedulerGateway;
