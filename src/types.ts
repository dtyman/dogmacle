export interface QuizItem {
  id: string;
  clue?: string;
  displayAnswer: string;
  acceptedAnswers?: string[];
  hint?: string;
  image?: string;
  match?: string;
  rank?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  mode?: 'grid' | 'photo' | 'match' | 'survivor' | 'order';
  distractorPool?: string[];
  columnLabels?: { left: string; right: string };
  maxAttempts?: number;
  optionsCount?: number;
  items: QuizItem[];
}
