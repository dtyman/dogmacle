import { useState } from 'react';
import type { Status } from '../pages/QuizPage';

interface MatchItem {
  id: string;
  displayAnswer: string;
  match?: string;
}

interface MatchingBoardProps {
  items: MatchItem[];
  columnLabels: { left: string; right: string };
  maxAttempts: number;
  attemptsUsed: number;
  matchedIds: Set<string>;
  status: Status;
  onAttempt: (itemId: string, correct: boolean) => void;
}

function shuffle<T>(input: T[]): T[] {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function MatchingBoard({
  items,
  columnLabels,
  maxAttempts,
  attemptsUsed,
  matchedIds,
  status,
  onAttempt,
}: MatchingBoardProps) {
  const [leftOrder] = useState(() => shuffle(items));
  const [rightOrder] = useState(() => shuffle(items));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);

  const locked = status !== 'playing';
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);

  const resolveAttempt = (leftId: string, rightId: string) => {
    const correct = leftId === rightId;
    onAttempt(leftId, correct);
    if (correct) {
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setWrongPair({ left: leftId, right: rightId });
      window.setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
    }
  };

  const selectLeft = (id: string) => {
    if (locked || wrongPair || matchedIds.has(id)) return;
    if (selectedLeft === id) {
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(id);
    if (selectedRight) resolveAttempt(id, selectedRight);
  };

  const selectRight = (id: string) => {
    if (locked || wrongPair || matchedIds.has(id)) return;
    if (selectedRight === id) {
      setSelectedRight(null);
      return;
    }
    setSelectedRight(id);
    if (selectedLeft) resolveAttempt(selectedLeft, id);
  };

  const classesFor = (id: string, side: 'left' | 'right') => {
    const selected = side === 'left' ? selectedLeft === id : selectedRight === id;
    const isWrong = wrongPair && (side === 'left' ? wrongPair.left === id : wrongPair.right === id);

    if (matchedIds.has(id)) {
      return 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300 cursor-default';
    }
    if (isWrong) {
      return 'border-red-700/60 bg-red-500/10 text-red-400 cursor-default';
    }
    if (selected) {
      return 'border-indigo-500 bg-indigo-500/10 text-indigo-200';
    }
    if (locked) {
      return 'border-slate-800 bg-slate-800/40 text-slate-500 cursor-default';
    }
    return 'border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-slate-700';
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-slate-400">
        Attempts remaining: {attemptsRemaining} / {maxAttempts}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {columnLabels.left}
          </h2>
          <div className="flex flex-col gap-2">
            {leftOrder.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={locked || matchedIds.has(item.id)}
                onClick={() => selectLeft(item.id)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-default ${classesFor(item.id, 'left')}`}
              >
                {item.displayAnswer}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {columnLabels.right}
          </h2>
          <div className="flex flex-col gap-2">
            {rightOrder.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={locked || matchedIds.has(item.id)}
                onClick={() => selectRight(item.id)}
                className={`rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-default ${classesFor(item.id, 'right')}`}
              >
                {item.match}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
