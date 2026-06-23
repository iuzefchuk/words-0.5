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
  html: string;
  isDestructive?: boolean;
  title?: string;
};

class Dialog {
  #html = $state<null | string>(null);

  #title = $state<null | string>(null);

  #isDestructive = $state(false);

  #pendingResolve: ((result: DialogResult) => void) | null = null;

  get html(): null | string {
    return this.#html;
  }

  get isDestructive(): boolean {
    return this.#isDestructive;
  }

  get isOpen(): boolean {
    return this.#html !== null;
  }

  get title(): null | string {
    return this.#title;
  }

  resolve({ status }: { status: DialogStatus }): void {
    if (this.#pendingResolve !== null) {
      this.#pendingResolve({
        isCanceled: status === DialogStatus.Canceled,
        isConfirmed: status === DialogStatus.Confirmed,
        isDismissed: status === DialogStatus.Dismissed,
      });
      this.#pendingResolve = null;
    }
  }

  async trigger({ html, isDestructive = false, title }: DialogTriggerParams): Promise<DialogResult> {
    this.#html = html;
    this.#title = title ?? null;
    this.#isDestructive = isDestructive;
    const result = await new Promise<DialogResult>(resolve => {
      this.#pendingResolve = resolve;
    });
    this.#resetState();
    return result;
  }

  #resetState(): void {
    this.#title = null;
    this.#html = null;
    this.#isDestructive = false;
  }
}

export default new Dialog();
