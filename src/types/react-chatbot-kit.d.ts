import * as React from "react";

type Constructor = new (...args: unknown[]) => unknown;

declare module "react-chatbot-kit" {
  export type ChatbotConfig = Record<string, unknown>;

  export interface ChatbotProps {
    config: ChatbotConfig;
    messageParser: Constructor;
    actionProvider: Constructor;
    // 기타 prop은 무시
    [key: string]: unknown;
  }

  export default class Chatbot extends React.Component<ChatbotProps> {}
}

// 빌드 경로로 로드되는 환경도 함께 덮어쓰기
declare module "react-chatbot-kit/build/main" {
  export * from "react-chatbot-kit";
  export { default } from "react-chatbot-kit";
}
