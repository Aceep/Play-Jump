import { useState } from 'react';
import { CharacterPreview } from './CharacterPreview';
import '../styles/CharacterSelector.css';

type CharacterType = 'luneblade' | 'satyr';

const characters: Array<{
  type: CharacterType;
  name: string;
  description: string;
  color: string;
  scale: number;
}> = [
  {
    type: 'luneblade',
    name: 'Luneblade',
    description: 'Agile warrior wielding moonlight',
    color: '#45b7d1',
    scale: 1
  },
  {
    type: 'satyr',
    name: 'Satyr',
    description: 'Mystical forest guardian',
    color: '#6bcf7f',
    scale: 2
  }
];

interface CharacterSelectorProps {
  onSelect: (type: CharacterType) => void | Promise<void>;
  isLoading: boolean;
}

export default function CharacterSelector({ onSelect, isLoading }: CharacterSelectorProps) {
  const [selected, setSelected] = useState<CharacterType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="character-selector-overlay">
      <div className="character-selector-container">
        <h2>Choose Your Champion</h2>

        <div className="characters-grid">
          {characters.map((c) => (
            <div
              key={c.type}
              className={`character-card ${selected === c.type ? 'selected' : ''}`}
              onClick={() => setSelected(c.type)}
            >
              <CharacterPreview
                type={c.type}
                color={c.color}
                scale={c.scale}
              />
              <h3>{c.name}</h3>
              <p>{c.description}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="button button-primary confirm-button"
          disabled={!selected || isLoading || submitting}
          onClick={async () => {
            if (!selected || isLoading || submitting) return;
            try {
              setSubmitting(true);
              const result = onSelect(selected);
              if (result && typeof (result as any).then === 'function') {
                await (result as Promise<void>);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {isLoading || submitting ? 'Summoning…' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
