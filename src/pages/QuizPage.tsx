import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Flag, Play } from 'lucide-react';
import quizzesData from '../data/quizzes.json';
import type { Quiz } from '../types';
import { formatTime, normalizeAnswer } from '../utils/normalize';
import AnswerSlot from '../components/AnswerSlot';
import PhotoSlideshow from '../components/PhotoSlideshow';
import MatchingBoard from '../components/MatchingBoard';
import SurvivorGrid from '../components/SurvivorGrid';
import OrderList from '../components/OrderList';
import ResultBanner from '../components/ResultBanner';
import ConfettiOverlay from '../components/ConfettiOverlay';

const quizzes = quizzesData as Quiz[];

export type Status = 'idle' | 'playing' | 'ended';
export type EndReason = 'won' | 'completed' | 'timeout' | 'gaveup' | 'lost' | null;

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const quiz = quizzes.find((q) => q.id === id);
  const inputRef = useRef<HTMLInputElement>(null);

  const runtimeItems = useMemo(
    () =>
      (quiz?.items ?? []).map((item, index) => ({
        ...item,
        clue: item.clue ?? String(index + 1),
        normalizedAnswers: (item.acceptedAnswers ?? []).map(normalizeAnswer),
      })),
    [quiz],
  );

  const [status, setStatus] = useState<Status>('idle');
  const [endReason, setEndReason] = useState<EndReason>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [missedIds, setMissedIds] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(quiz?.timeLimit ?? 0);
  const [inputValue, setInputValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [orderCorrectCount, setOrderCorrectCount] = useState(0);

  const isPhotoMode = quiz?.mode === 'photo';
  const isMatchMode = quiz?.mode === 'match';
  const isSurvivorMode = quiz?.mode === 'survivor';
  const isOrderMode = quiz?.mode === 'order';
  const hasHints = runtimeItems.some((item) => item.hint);
  const total = runtimeItems.length;
  const score = isOrderMode ? orderCorrectCount : revealedIds.size;
  const attempted = score + missedIds.size;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const maxAttempts = quiz?.maxAttempts ?? total;
  const optionsCount = quiz?.optionsCount ?? total;

  useEffect(() => {
    if (status !== 'playing') return;
    if (timeRemaining <= 0) {
      setStatus('ended');
      setEndReason('timeout');
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setTimeRemaining((t) => t - 1);
    }, 1000);
    return () => window.clearTimeout(timeoutId);
  }, [status, timeRemaining]);

  useEffect(() => {
    if (status !== 'playing' || total === 0) return;
    const finished = isPhotoMode
      ? attempted === total
      : isMatchMode
        ? score === total || attemptsUsed >= maxAttempts
        : isSurvivorMode
          ? score === total
          : false;
    if (finished) {
      setStatus('ended');
      setEndReason(score === total ? 'won' : 'completed');
    }
  }, [status, total, attempted, score, isPhotoMode, isMatchMode, isSurvivorMode, attemptsUsed, maxAttempts]);

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-slate-200">
        <p>Quiz not found.</p>
        <Link to="/" className="flex items-center gap-2 text-indigo-400 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to quizzes
        </Link>
      </div>
    );
  }

  const startQuiz = () => {
    setRevealedIds(new Set());
    setMissedIds(new Set());
    setTimeRemaining(quiz.timeLimit);
    setInputValue('');
    setCurrentIndex(0);
    setAttemptsUsed(0);
    setOrderCorrectCount(0);
    setEndReason(null);
    setStatus('playing');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const giveUp = () => {
    setStatus('ended');
    setEndReason('gaveup');
  };

  const playAgain = () => {
    setStatus('idle');
    setEndReason(null);
    setRevealedIds(new Set());
    setMissedIds(new Set());
    setInputValue('');
    setCurrentIndex(0);
    setAttemptsUsed(0);
    setOrderCorrectCount(0);
    setTimeRemaining(quiz.timeLimit);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (status !== 'playing') return;

    const normalized = normalizeAnswer(value);
    if (!normalized) return;

    const match = runtimeItems.find(
      (item) => !revealedIds.has(item.id) && item.normalizedAnswers.includes(normalized),
    );
    if (match) {
      setRevealedIds((prev) => new Set(prev).add(match.id));
      setInputValue('');
    }
  };

  const urgency =
    status === 'playing' && timeRemaining <= 10
      ? 'text-red-400'
      : status === 'playing' && timeRemaining <= 30
        ? 'text-amber-400'
        : 'text-slate-100';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-slate-400 transition hover:text-slate-200">
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Quizzes</span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`flex items-center gap-2 font-mono text-lg font-semibold ${urgency}`}>
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
            <div className="text-lg font-semibold text-slate-100">
              {score} / {total}{' '}
              <span className="text-sm font-normal text-slate-400">({percent}%)</span>
            </div>
            {status === 'playing' && (
              <button
                onClick={giveUp}
                className="flex items-center gap-1.5 rounded-lg bg-red-600/20 px-3 py-1.5 text-sm font-medium text-red-300 transition hover:bg-red-600/30"
              >
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Give Up</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-100">{quiz.title}</h1>
        <p className="mt-1 text-slate-400">{quiz.description}</p>

        {status === 'idle' && (
          <button
            onClick={startQuiz}
            className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            <Play className="h-5 w-5" fill="currentColor" />
            Start Quiz
          </button>
        )}

        {status !== 'idle' && isPhotoMode && (
          <PhotoSlideshow
            items={runtimeItems}
            distractorPool={quiz.distractorPool ?? []}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            revealedIds={revealedIds}
            missedIds={missedIds}
            status={status}
            onReveal={(itemId) => setRevealedIds((prev) => new Set(prev).add(itemId))}
            onMiss={(itemId) => setMissedIds((prev) => new Set(prev).add(itemId))}
          />
        )}

        {status !== 'idle' && isMatchMode && (
          <MatchingBoard
            items={runtimeItems}
            columnLabels={quiz.columnLabels ?? { left: 'Left', right: 'Right' }}
            maxAttempts={maxAttempts}
            attemptsUsed={attemptsUsed}
            matchedIds={revealedIds}
            status={status}
            onAttempt={(itemId, correct) => {
              if (correct) {
                setRevealedIds((prev) => new Set(prev).add(itemId));
              }
              setAttemptsUsed((prev) => prev + 1);
            }}
          />
        )}

        {status !== 'idle' && isSurvivorMode && (
          <SurvivorGrid
            items={runtimeItems}
            distractorPool={quiz.distractorPool ?? []}
            optionsCount={optionsCount}
            revealedIds={revealedIds}
            status={status}
            onCorrect={(itemId) => setRevealedIds((prev) => new Set(prev).add(itemId))}
            onWrong={() => {
              setStatus('ended');
              setEndReason('lost');
            }}
          />
        )}

        {status !== 'idle' && isOrderMode && (
          <OrderList
            items={runtimeItems.map((item, index) => ({
              id: item.id,
              displayAnswer: item.displayAnswer,
              rank: item.rank ?? index,
            }))}
            status={status}
            onProgressChange={setOrderCorrectCount}
            onSolved={() => {
              setStatus('ended');
              setEndReason('won');
            }}
          />
        )}

        {status !== 'idle' && !isPhotoMode && !isMatchMode && !isSurvivorMode && !isOrderMode && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={status !== 'playing'}
            placeholder={status === 'playing' ? 'Type an answer…' : ''}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 disabled:opacity-50"
          />
        )}

        {status === 'ended' && (
          <ResultBanner reason={endReason} score={score} total={total} onPlayAgain={playAgain} />
        )}

        {!isPhotoMode && !isMatchMode && !isSurvivorMode && !isOrderMode && (
          <div
            className={`mt-8 grid grid-cols-1 gap-3 ${hasHints ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
          >
            {runtimeItems.map((item) => (
              <AnswerSlot
                key={item.id}
                clue={item.clue}
                displayAnswer={item.displayAnswer}
                revealed={revealedIds.has(item.id)}
                missed={status === 'ended' && !revealedIds.has(item.id)}
                hint={item.hint}
              />
            ))}
          </div>
        )}
      </main>

      {status === 'ended' && endReason === 'won' && <ConfettiOverlay />}
    </div>
  );
}
