// src/chatbot/widgets/QuickActions.tsx
import type { ButtonHTMLAttributes } from "react";
import ActionProvider from "../ActionProvider";

type Props = { actionProvider: ActionProvider };

// Button props 타입을 표준 타입으로!
const Btn = (p: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="px-3 py-1.5 rounded-full border border-line text-sm text-cocoa bg-white hover:bg-butter-50 transition"
    {...p}
  />
);

export default function QuickActions({ actionProvider }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Btn onClick={() => actionProvider.tellTemperature()}>지금 온도</Btn>
      <Btn onClick={() => actionProvider.tellHumidity()}>지금 습도</Btn>
      <Btn onClick={() => actionProvider.latestLog()}>최근 로그</Btn>
      <Btn onClick={() => actionProvider.help()}>도움말</Btn>
    </div>
  );
}
