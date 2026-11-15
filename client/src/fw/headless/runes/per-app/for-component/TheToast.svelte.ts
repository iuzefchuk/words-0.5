type TriggerParams = {
  body: string;
};

class TheToastStore {
  body = $state<null | string>(null);

  triggerCount = $state(0);

  dismiss(): void {
    this.body = null;
  }

  trigger({ body }: TriggerParams): void {
    this.body = body;
    this.triggerCount += 1;
  }
}

export default new TheToastStore();
