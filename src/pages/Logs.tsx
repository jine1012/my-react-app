// src/pages/Logs.tsx
import React, { useState } from "react";

interface LogItem {
  id: number;
  type: "cry" | "temp" | "note";
  timestamp: string;
  message: string;
}

type LogFilterType = LogItem["type"] | "all";

const sampleLogs: LogItem[] = [
  { id: 1, type: "cry", timestamp: "2025-08-09 10:30", message: "아기가 울음" },
  { id: 2, type: "temp", timestamp: "2025-08-09 11:00", message: "온도 26°C" },
  { id: 3, type: "note", timestamp: "2025-08-09 12:00", message: "분유 먹임" },
  { id: 4, type: "cry", timestamp: "2025-08-09 13:20", message: "아기가 울음" },
];

export default function Logs() {
  const [type, setType] = useState<LogFilterType>("all");

  const filteredLogs =
    type === "all" ? sampleLogs : sampleLogs.filter((log) => log.type === type);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📜 로그 기록</h1>

      {/* 필터 */}
      <div className="mb-4">
        <label htmlFor="logFilter" className="mr-2 font-medium">
          필터:
        </label>
        <select
          id="logFilter"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          value={type}
          onChange={(e) => setType(e.target.value as LogFilterType)}
        >
          <option value="all">전체</option>
          <option value="cry">울음</option>
          <option value="temp">온도</option>
          <option value="note">메모</option>
        </select>
      </div>

      {/* 로그 리스트 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="border-b last:border-b-0 py-3 flex justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">{log.timestamp}</p>
                <p className="text-gray-800">{log.message}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-sm font-semibold ${
                  log.type === "cry"
                    ? "bg-red-100 text-red-600"
                    : log.type === "temp"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {log.type}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">로그가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
