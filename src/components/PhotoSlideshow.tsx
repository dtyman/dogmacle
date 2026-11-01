import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import type { Status } from '../pages/QuizPage';

interface SlideshowItem {
  id: string;
  displayAnswer: string;
  image?: string;
}

interface PhotoSlideshowProps {
  items: SlideshowItem[];
  distractorPool: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  revealedIds: Set<string>;
  missedIds: Set<string>;
  status: Status;
  onReveal: (id: string) => void;
  onMiss: (id: string) => void;
}

function shuffle<T>(input: T[]): T[] {
  const result = [...input];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PhotoSlideshow({
  items,
  distractorPool,
  currentIndex,
  onIndexChange,
  revealedIds,
  missedIds,
  status,
  onReveal,
  onMiss,
}: PhotoSlideshowProps) {
  const total = items.length;
  const item = items[currentIndex];
  const [imageFailed, setImageFailed] = useState(false);
  const [optionsByItem, setOptionsByItem] = useState<Record<string, string[]>>({});
  const [wrongPicks, setWrongPicks] = useState<Record<string, string>>({});

  useEffect(() => {
    setImageFailed(false);
  }, [currentIndex]);

  useEffect(() => {
    if (!item) return;
    setOptionsByItem((prev) => {
      if (prev[item.id]) return prev;
      const pool = distractorPool.filter((distractor) => distractor !== item.displayAnswer);
      const picks = shuffle(pool).slice(0, 3);
      return { ...prev, [item.id]: shuffle([item.displayAnswer, ...picks]) };
    });
  }, [item, distractorPool]);

  if (!item) return null;

  const options = optionsByItem[item.id] ?? [];

  const revealed = revealedIds.has(item.id);
  const missedNow = missedIds.has(item.id);
  const missed = missedNow || (status === 'ended' && !revealed);
  const locked = status !== 'playing' || revealed || missedNow;

  const goTo = (index: number) => {
    onIndexChange(((index % total) + total) % total);
  };

  const advanceToNextOpen = (justAnsweredId: string) => {
    for (let offset = 1; offset <= total; offset++) {
      const nextIndex = (currentIndex + offset) % total;
      const nextItem = items[nextIndex];
      if (nextItem.id === justAnsweredId || revealedIds.has(nextItem.id) || missedIds.has(nextItem.id)) {
        continue;
      }
      onIndexChange(nextIndex);
      return;
    }
  };

  const handlePick = (option: string) => {
    if (locked) return;
    if (option === item.displayAnswer) {
      onReveal(item.id);
    } else {
      setWrongPicks((prev) => ({ ...prev, [item.id]: option }));
      onMiss(item.id);
    }
    advanceToNextOpen(item.id);
  };

  let frameClasses = 'border-slate-700';
  if (revealed) frameClasses = 'border-emerald-600/60 ring-2 ring-emerald-500/30';
  else if (missed) frameClasses = 'border-red-700/60 ring-2 ring-red-500/20';

  return (
    <div className="mt-6">
      <p className="text-sm text-slate-400">
        Picture {currentIndex + 1} of {total}
      </p>

      <div className="mt-2 flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          className="shrink-0 rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700"
          aria-label="Previous picture"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={`relative mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center overflow-hidden rounded-xl border bg-slate-800/60 transition-colors ${frameClasses}`}
          >
            {item.image && !imageFailed ? (
              <img
                src={item.image}
                alt={revealed || missed ? item.displayAnswer : 'Guess the country'}
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">Image not found</span>
              </div>
            )}
          </div>

          {(revealed || missed) && (
            <p
              className={`mt-2 text-center font-semibold ${revealed ? 'text-emerald-300' : 'text-red-400/90'}`}
            >
              {item.displayAnswer}
            </p>
          )}

          <div className="mx-auto mt-3 grid max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const isCorrect = option === item.displayAnswer;
              const isWrongPick = wrongPicks[item.id] === option;
              let classes =
                'border-slate-700 bg-slate-800 text-slate-100 hover:border-indigo-500 hover:bg-slate-700';
              if (locked) {
                if (isCorrect) {
                  classes = 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300';
                } else if (isWrongPick) {
                  classes = 'border-red-700/60 bg-red-500/10 text-red-400';
                } else {
                  classes = 'border-slate-800 bg-slate-800/40 text-slate-500';
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={locked}
                  onClick={() => handlePick(option)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-default ${classes}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo(currentIndex + 1)}
          className="shrink-0 rounded-full border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:bg-slate-700"
          aria-label="Next picture"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
