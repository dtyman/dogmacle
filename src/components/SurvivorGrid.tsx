import { useState } from 'react';
import type { Status } from '../pages/QuizPage';

interface SurvivorItem {
  id: string;
  displayAnswer: string;
}

interface Option {
  id: string;
  label: string;
  isCorrect: boolean;
}

interface SurvivorGridProps {
  items: SurvivorItem[];
  distractorPool: string[];
  optionsCount: number;
  revealedIds: Set<string>;
  status: Status;
  onCorrect: (id: string) => void;
  onWrong: () => void;
}

function shuffle<T>(input: T[]): T[] {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildOptions(items: SurvivorItem[], distractorPool: string[], optionsCount: number): Option[] {
  const correct: Option[] = items.map((item) => ({
    id: item.id,
    label: item.displayAnswer,
    isCorrect: true,
  }));
  const distractorsNeeded = Math.max(0, optionsCount - correct.length);
  const distractors: Option[] = shuffle(distractorPool)
    .slice(0, distractorsNeeded)
    .map((label, index) => ({ id: `distractor-${index}-${label}`, label, isCorrect: false }));
  return shuffle([...correct, ...distractors]);
}

export default function SurvivorGrid({
  items,
  distractorPool,
  optionsCount,
  revealedIds,
  status,
  onCorrect,
  onWrong,
}: SurvivorGridProps) {
  const [options] = useState(() => buildOptions(items, distractorPool, optionsCount));
  const [fatalWrongId, setFatalWrongId] = useState<string | null>(null);

  const locked = status !== 'playing';

  const handleClick = (option: Option) => {
    if (locked || fatalWrongId || revealedIds.has(option.id)) return;
    if (option.isCorrect) {
      onCorrect(option.id);
    } else {
      setFatalWrongId(option.id);
      onWrong();
    }
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-slate-400">
        Pick correctly to score a point — one wrong pick ends the game instantly.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {options.map((option) => {
          const isRevealed = revealedIds.has(option.id);
          const isFatal = fatalWrongId === option.id;

          let classes =
            'border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-slate-700';
          if (isRevealed) {
            classes = 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300';
          } else if (isFatal) {
            classes = 'border-red-700/60 bg-red-500/10 text-red-400';
          } else if (locked) {
            classes = option.isCorrect
              ? 'border-emerald-800/60 bg-transparent text-emerald-500/70'
              : 'border-slate-800 bg-slate-800/40 text-slate-500';
          }

          return (
            <button
              key={option.id}
              type="button"
              disabled={locked || isRevealed}
              onClick={() => handleClick(option)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-default ${classes}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
