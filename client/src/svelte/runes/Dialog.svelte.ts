export enum DialogStatus {
  Canceled = 'Canceled',
  Confirmed = 'Confirmed',
  Dismissed = 'Dismissed',
}

export type DialogResult = {
  isCanceled: boolean;
  isConfirmed: boolean;
  isDismissed: boolean;
};

type DialogTriggerParams = {
  body: string;
  isDestructive?: boolean;
  title?: string;
};

class Dialog {
  body = $state<null | string>(null);

  isDestructive = $state(false);

  title = $state<null | string>(null);

  get isOpen(): boolean {
    return this.body !== null;
  }

  private pendingResolve: ((result: DialogResult) => void) | null = null;

  resolve({ status }: { status: DialogStatus }): void {
    if (this.pendingResolve !== null) {
      this.pendingResolve({
        isCanceled: status === DialogStatus.Canceled,
        isConfirmed: status === DialogStatus.Confirmed,
        isDismissed: status === DialogStatus.Dismissed,
      });
      this.pendingResolve = null;
    }
  }

  async trigger({ body, isDestructive = false, title }: DialogTriggerParams): Promise<DialogResult> {
    this.body = body;
    this.title = title ?? null;
    this.isDestructive = isDestructive;
    const result = await new Promise<DialogResult>(resolve => {
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

export default new Dialog();
