import SectionCard from "../components/SectionCard";

export default function Settings() {
  const exportData = () => {
    const payload = {
      logs: JSON.parse(localStorage.getItem("baby-logs") || "[]"),
      diary: localStorage.getItem("baby-diary") || "",
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `baby-monitor-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return;
      const txt = await file.text();
      try {
        const data = JSON.parse(txt);
        if (data.logs)  localStorage.setItem("baby-logs", JSON.stringify(data.logs));
        if (typeof data.diary === "string") localStorage.setItem("baby-diary", data.diary);
        alert("복원되었습니다."); location.reload();
      } catch { alert("파일 형식이 올바르지 않습니다."); }
    };
    input.click();
  };

  const clearAll = () => {
    if (confirm("모든 로컬 데이터를 삭제할까요?")) { localStorage.clear(); location.reload(); }
  };

  return (
    <div className="grid gap-3">
      <SectionCard title="데이터">
        <div className="flex gap-2">
          <button className="btn" onClick={exportData}>백업(Export)</button>
          <button className="btn" onClick={importData}>복원(Import)</button>
          <button className="btn" onClick={clearAll}>모두 삭제</button>
        </div>
      </SectionCard>

      <SectionCard title="테마">
        <p className="text-sm text-cocoa-50">
          현재는 버터톤(cream) 테마입니다. 필요하면 <code>tailwind.config.js</code>의 colors.butter/cocoa를 수정해 커스터마이즈하세요.
        </p>
      </SectionCard>
    </div>
  );
}
