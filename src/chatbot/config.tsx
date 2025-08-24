// src/chatbot/config.tsx
import { createChatBotMessage } from "react-chatbot-kit";
import QuickActions from "./widgets/QuickActions";
import type ActionProvider from "./ActionProvider";
import axios from "axios";

type WidgetProps = { actionProvider: ActionProvider };

const config = {
  botName: "BabyBot",
  initialMessages: [
    createChatBotMessage("안녕하세요! 무엇을 도와드릴까요?", {
      widget: "quickActions",
      delay: 200,
    }),
  ], 
  customStyles: {
    botMessageBox: { backgroundColor: "#f3e8c9" }, // butter-200
    chatButton: { backgroundColor: "#6b4f30" },    // cocoa
  },
  widgets: [
    {
      widgetName: "quickActions",
      widgetFunc: (props: WidgetProps) => <QuickActions {...props} />,
    },
  ],
}

export async function sendMessageToBot(message: string) {
  try {
    const response = await axios.post("http://127.0.0.1:8000/chat", { message });
    return response.data.answer;
  } catch (error) {
    console.error("API 호출 에러:", error);
    return "서버와 연결할 수 없습니다.";
  }
}


export default config;
