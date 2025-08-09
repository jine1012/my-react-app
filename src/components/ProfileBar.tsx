import { useState } from 'react';

export type Baby = { id: string; name: string; avatar?: string; note?: string };

const initial: Baby[] = [
  { id: 'b1', name: '하람', avatar: 'https://placekitten.com/80/80' },
  { id: 'b2', name: '다온', avatar: 'https://placekitten.com/81/81' },
  { id: 'b3', name: '서준', avatar: 'https://placekitten.com/82/82' },
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

  return (
    <div className="pb-wrapper">
      <div className="pb-track">
        {babies.map((b) => (
          <button
            key={b.id}
            className={`pb-chip ${selected === b.id ? 'is-active' : ''}`}
            onClick={() => click(b.id)}
            title={b.name}
          >
            <img className="pb-avatar" src={b.avatar} alt={b.name} />
            <span className="pb-name">{b.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
