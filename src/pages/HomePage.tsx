import { Brain } from 'lucide-react';
import quizzesData from '../data/quizzes.json';
import type { Quiz } from '../types';
import QuizCard from '../components/QuizCard';

const quizzes = quizzesData as Quiz[];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 bg-slate-950/60">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center gap-3">
            <Brain className="h-9 w-9 text-indigo-400" />
            <h1 className="text-3xl font-bold text-slate-100">Dogmacle</h1>
          </div>
          <p className="mt-2 text-slate-400">
            
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </main>
    </div>
  );
}
