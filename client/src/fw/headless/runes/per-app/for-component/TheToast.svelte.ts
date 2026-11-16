export enum TheToastAccent {
  Bad = 'Bad',
  Good = 'Good',
}

type TriggerParams = {
  accent: TheToastAccent;
  body: string;
};

class TheToastStore {
  accent = $state(TheToastAccent.Good);

  body = $state<null | string>(null);

  triggerCount = $state(0);

  dismiss(): void {
    this.body = null;
  }

  trigger({ accent, body }: TriggerParams): void {
    this.accent = accent;
    this.body = body;
    this.triggerCount += 1;
  }
}

export default new TheToastStore();
