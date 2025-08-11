// src/chatbot/types.ts
export type ChatState = { messages: unknown[] };

// react-chatbot-kit 이 제공하는 createChatBotMessage 타입만 가져와서 별칭으로 사용
export type CreateMessageFn = (text: string, options?: Record<string, unknown>) => unknown;

// 라이브러리가 ActionProvider/MessageParser 생성자에 넘기는 stateRef 형태
export type StateRef = { state: ChatState };
