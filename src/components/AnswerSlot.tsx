interface AnswerSlotProps {
  clue: string;
  displayAnswer: string;
  revealed: boolean;
  missed: boolean;
  hint?: string;
}

export default function AnswerSlot({ clue, displayAnswer, revealed, missed, hint }: AnswerSlotProps) {
  let stateClasses = 'border-slate-700 bg-slate-800/40 text-slate-500';
  if (revealed) {
    stateClasses = 'border-emerald-600/50 bg-emerald-500/10 text-emerald-300';
  } else if (missed) {
    stateClasses = 'border-red-800/60 bg-red-500/10 text-red-400/90';
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${stateClasses}`}
    >
      <span className="w-10 shrink-0 font-mono text-xs text-slate-500">{clue}</span>
      <span className={`truncate font-medium ${hint ? 'w-2/5 shrink-0' : 'flex-1'}`}>
        {revealed || missed ? displayAnswer : ' '}
      </span>
      {hint && (
        <span className="flex-1 truncate border-l border-slate-700/70 pl-3 text-xs font-normal italic text-slate-400">
          {hint}
        </span>
      )}
    </div>
  );
}
