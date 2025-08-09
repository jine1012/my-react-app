import SectionCard from "../components/SectionCard";
import EmptyState from "../components/EmptyState";
import { Camera, Link } from "lucide-react";

const streamUrl = (import.meta.env.VITE_STREAM_URL ?? "").trim();

export default function Live() {
  if (!streamUrl) {
    return (
      <EmptyState
        icon={<Camera className="text-cocoa" />}
        title="스트림이 설정되지 않았습니다"
        desc="라즈베리파이를 HLS/MP4로 송출하고 .env에 VITE_STREAM_URL을 지정하세요."
        cta={
          <div className="text-xs text-cocoa-50 flex items-center gap-1">
            <Link size={14} /> 예: VITE_STREAM_URL=https://example.com/stream.m3u8
          </div>
        }
      />
    );
  }

  return (
    <div className="grid gap-3">
      <SectionCard title="실시간 영상">
        <video
          className="w-full aspect-video rounded-2xl border border-line bg-butter-50"
          src={streamUrl}
          controls
          playsInline
          // autoPlay // 필요 시 자동재생
          // muted    // 모바일 자동재생 허용용
        />
        <p className="text-xs text-cocoa-50 mt-2">
          HLS가 아니라면 MP4 프리뷰로 재생됩니다.
        </p>
      </SectionCard>
    </div>
  );
}
