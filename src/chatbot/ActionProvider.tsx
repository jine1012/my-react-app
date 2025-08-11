// src/chatbot/ActionProvider.tsx
import type { ReactNode } from "react";

type ChatbotState = { messages: ReadonlyArray<unknown> };
type CreateMsg = (text: string, options?: Record<string, unknown>) => unknown;
type SetState = (updater: (prev: ChatbotState) => ChatbotState) => void;

export default class ActionProvider {
  private readonly createMessage: CreateMsg;
  private readonly setState: SetState;

  constructor(createChatBotMessage: CreateMsg, setStateFunc: SetState) {
    this.createMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  private pushMessage(node: ReactNode, options?: Record<string, unknown>): void {
    const msg = this.createMessage(String(node), options);
    this.setState(prev => ({ ...prev, messages: [...prev.messages, msg] }));
  }

  tellTemperature = (): void => { this.pushMessage("지금 온도는 23.2°C 입니다."); };
  tellHumidity    = (): void => { this.pushMessage("현재 습도는 48% 입니다."); };
  latestLog       = (): void => { this.pushMessage("최근 로그를 확인해보세요.", { widget: "quickActions" }); };
  help            = (): void => { this.pushMessage("‘온도’, ‘습도’, ‘로그’ 등으로 물어보세요.", { widget: "quickActions" }); };
}

