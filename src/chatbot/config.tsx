// src/chatbot/config.tsx
import { createChatBotMessage } from "react-chatbot-kit";
import QuickActions from "./widgets/QuickActions";
import type ActionProvider from "./ActionProvider";

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

export default config;
