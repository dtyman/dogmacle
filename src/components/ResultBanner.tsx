import { PartyPopper, TimerOff, Flag, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { EndReason } from '../pages/QuizPage';

interface ResultBannerProps {
  reason: EndReason;
  score: number;
  total: number;
  onPlayAgain: () => void;
}

export default function ResultBanner({ reason, score, total, onPlayAgain }: ResultBannerProps) {
  const won = reason === 'won';
  const Icon =
    won ? PartyPopper
    : reason === 'timeout' ? TimerOff
    : reason === 'gaveup' ? Flag
    : reason === 'lost' ? XCircle
    : CheckCircle2;
  const title =
    won ? 'You got them all!'
    : reason === 'timeout' ? "Time's up!"
    : reason === 'gaveup' ? 'Quiz ended'
    : reason === 'lost' ? 'Wrong pick — game over!'
    : 'Quiz complete!';

  return (
    <div
      className={`mt-6 flex flex-col items-start gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
        won ? 'border-emerald-600/50 bg-emerald-500/10' : 'border-red-700/50 bg-red-500/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-6 w-6 ${won ? 'text-emerald-400' : 'text-red-400'}`} />
        <div>
          <p className={`font-semibold ${won ? 'text-emerald-300' : 'text-red-300'}`}>{title}</p>
          <p className="text-sm text-slate-400">
            Final score: {score} / {total}
          </p>
        </div>
      </div>
      <button
        onClick={onPlayAgain}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
      >
        <RotateCcw className="h-4 w-4" />
        Play Again
      </button>
    </div>
  );
}
