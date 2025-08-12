// src/components/Splash.tsx
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import babyAnim from "../assets/Baby-anim.json"; // lottiefiles.com에서 받은 json

export default function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1200); // 1.2s 후 사라짐
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-butter">
      <div className="w-56 rounded-2xl border border-line bg-white/90 p-6 shadow-xl">
        <Lottie animationData={babyAnim} loop autoplay />
        <p className="mt-2 text-center text-cocoa text-sm">로딩 중…</p>
      </div>
    </div>
  );
}
