export enum TheDialogStatus {
  Canceled = 'Canceled',
  Confirmed = 'Confirmed',
  Dismissed = 'Dismissed',
}

export type TheDialogResult = {
  isCanceled: boolean;
  isConfirmed: boolean;
  isDismissed: boolean;
};

type TriggerParams = {
  body: string;
  isDestructive?: boolean;
  title?: string;
};

class TheDialogStore {
  body = $state<null | string>(null);

  isDestructive = $state(false);

  title = $state<null | string>(null);

  get isOpen(): boolean {
    return this.body !== null;
  }

  private pendingResolve: ((result: TheDialogResult) => void) | null = null;

  resolve({ status }: { status: TheDialogStatus }): void {
    if (this.pendingResolve !== null) {
      this.pendingResolve({
        isCanceled: status === TheDialogStatus.Canceled,
        isConfirmed: status === TheDialogStatus.Confirmed,
        isDismissed: status === TheDialogStatus.Dismissed,
      });
      this.pendingResolve = null;
    }
  }

  async trigger({ body, isDestructive = false, title }: TriggerParams): Promise<TheDialogResult> {
    this.body = body;
    this.title = title ?? null;
    this.isDestructive = isDestructive;
    const result = await new Promise<TheDialogResult>(resolve => {
      this.pendingResolve = resolve;
    });
    this.resetState();
    return result;
  }

  private resetState(): void {
    this.title = null;
    this.body = null;
    this.isDestructive = false;
  }
}

export default new TheDialogStore();
