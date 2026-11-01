import { useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { Status } from '../pages/QuizPage';

interface OrderListItem {
  id: string;
  displayAnswer: string;
  rank: number;
}

interface OrderListProps {
  items: OrderListItem[];
  status: Status;
  onProgressChange: (correctCount: number) => void;
  onSolved: () => void;
}

export default function OrderList({ items, status, onProgressChange, onSolved }: OrderListProps) {
  const [order, setOrder] = useState(items);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const solvedRef = useRef(false);

  const locked = status !== 'playing';

  const correctness = useMemo(
    () =>
      order.map((item, i) => {
        const leftIsPreceding = i > 0 && order[i - 1].rank === item.rank - 1;
        const rightIsFollowing = i < order.length - 1 && order[i + 1].rank === item.rank + 1;
        return leftIsPreceding || rightIsFollowing;
      }),
    [order],
  );

  useEffect(() => {
    onProgressChange(correctness.filter(Boolean).length);
    const sorted = order.every((item, i) => i === 0 || order[i - 1].rank < item.rank);
    if (sorted && !solvedRef.current) {
      solvedRef.current = true;
      onSolved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const handleDragStart = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (locked) return;
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    if (locked || dragIndex === null) return;
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (locked || dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="mt-6">
      <p className="text-sm text-slate-400">
        Drag items into chronological order. Correctly-placed items turn green.
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {order.map((item, index) => {
          const isCorrect = correctness[index];
          const isDragging = dragIndex === index;
          const isDragOver = dragOverIndex === index && dragIndex !== null && dragIndex !== index;

          let classes = 'border-slate-700 bg-slate-800 text-slate-100';
          if (isCorrect) {
            classes = 'border-emerald-600/60 bg-emerald-500/10 text-emerald-300';
          } else if (locked) {
            classes = 'border-slate-800 bg-slate-800/40 text-slate-500';
          }

          return (
            <div
              key={item.id}
              draggable={!locked}
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${classes} ${
                isDragging ? 'opacity-40' : ''
              } ${isDragOver ? 'border-indigo-500' : ''} ${locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <GripVertical className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="w-6 shrink-0 font-mono text-xs text-slate-500">{index + 1}</span>
              <span className="flex-1">{item.displayAnswer}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
