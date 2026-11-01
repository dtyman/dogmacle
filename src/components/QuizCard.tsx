import { Link } from 'react-router-dom';
import { ListChecks, Timer, Play } from 'lucide-react';
import type { Quiz } from '../types';
import { formatTime } from '../utils/normalize';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 shadow-lg backdrop-blur transition hover:border-indigo-500/60 hover:bg-slate-800/80">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">{quiz.title}</h2>
        <p className="mt-2 text-sm text-slate-400">{quiz.description}</p>
      </div>

      <div className="mt-5 flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <ListChecks className="h-4 w-4" />
          {quiz.items.length} items
        </span>
        <span className="flex items-center gap-1.5">
          <Timer className="h-4 w-4" />
          {formatTime(quiz.timeLimit)}
        </span>
      </div>

      <Link
        to={`/quiz/${quiz.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-500"
      >
        <Play className="h-4 w-4" fill="currentColor" />
        Play
      </Link>
    </div>
  );
}
