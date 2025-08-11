// src/pages/Chat.tsx
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import "../chatbot/chatbot.css";

import rawConfig from "../chatbot/config";
import  MessageParser  from "../chatbot/MessageParser";
import ActionProvider from "../chatbot/ActionProvider";

export default function Chat() {
  // Chatbot이 실제로 요구하는 prop 타입을 그대로 가져오기 (타입 임포트 X)
  type ChatbotProps = React.ComponentProps<typeof Chatbot>;

  // readonly로 잡히는 initialMessages를 가변 배열로 복사해서 타입 충돌 방지
  const botConfig = {
    ...rawConfig,
    initialMessages: Array.from(rawConfig.initialMessages),
  } as ChatbotProps["config"];

  // 필요 시 파서/프로바이더도 동일 방식으로 맞춤
  const Parser = MessageParser as ChatbotProps["messageParser"];
  const Provider = ActionProvider as ChatbotProps["actionProvider"];

  return (
    <div className="ui-app">
      <header className="ui-header">
        <div className="ui-header-inner">
          <h1 className="ui-title text-cocoa">Chat</h1>
        </div>
      </header>

      <main className="ui-main">
        <div className="container max-w-xl mx-auto">
          <Chatbot
            config={botConfig}
            messageParser={Parser}
            actionProvider={Provider}
          />
        </div>
      </main>
    </div>
  );
}



