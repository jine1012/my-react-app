import { useState } from 'react';

export type Baby = { 
  id: string; 
  name: string; 
  avatar?: string; 
  note?: string;
};

const initial: Baby[] = [
  { id: 'b1', name: '민기', avatar: '👶' },
];

export default function ProfileBar({
  babies = initial,
  onChange,
}: {
  babies?: Baby[];
  onChange?: (id: string) => void;
}) {
  const [selected, setSelected] = useState(babies[0]?.id);

  const click = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  const handleAddProfile = () => {
    // 추가 버튼 클릭 핸들러 - 부모 컴포넌트에서 처리하도록 콜백 추가 가능
    console.log('프로필 추가');
  };

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-2 rounded-lg border border-amber-200/40">
      {/* Profile Buttons */}
      {babies.map((baby) => (
        <button
          key={baby.id}
          className={`
            flex flex-col items-center gap-1 group transition-all duration-200 ease-out
            ${selected === baby.id ? 'transform scale-105' : 'hover:scale-102'}
          `}
          onClick={() => click(baby.id)}
          title={baby.name}
        >
          <div className={`
            relative bg-white rounded-full p-1 shadow-sm
            transition-all duration-200 border-2
            ${selected === baby.id
              ? 'border-amber-400 shadow-md shadow-amber-200/50'
              : 'border-amber-200/60 hover:border-amber-300'
            }
          `}>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-lg">
              {baby.avatar?.startsWith('http') ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={baby.avatar}
                  alt={baby.name}
                />
              ) : (
                <span>{baby.avatar}</span>
              )}
            </div>
          </div>
          <span className="text-xs font-medium text-amber-700">{baby.name}</span>
        </button>
      ))}

      {/* Add Button */}
      <button
        onClick={handleAddProfile}
        className="flex flex-col items-center gap-1 group transition-all duration-200 ease-out hover:scale-102"
        title="프로필 추가"
      >
        <div className="bg-white rounded-full p-1 shadow-sm border-2 border-amber-200/60 hover:border-amber-300 transition-all duration-200">
          <div className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors duration-200">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
        <span className="text-xs font-medium text-amber-600">추가</span>
      </button>
    </div>
  );
}