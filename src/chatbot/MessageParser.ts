export interface ChatActions {
  tellTemperature: () => void;
  tellHumidity: () => void;
  latestLog: () => void;
  help: () => void;
}

export default class MessageParser {
  private readonly actions: ChatActions;

  constructor(actionProvider: ChatActions) {
    this.actions = actionProvider;
  }

  parse(text: string): void {
    const q = text.toLowerCase().trim();

    if (/(temp|온도)/.test(q)) return this.actions.tellTemperature();
    if (/(humid|습도)/.test(q)) return this.actions.tellHumidity();
    if (/(log|기록|최근)/.test(q)) return this.actions.latestLog();

    this.actions.help();
  }
}

