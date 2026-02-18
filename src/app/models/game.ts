import { User } from '@angular/fire/auth';
import { Quiz } from './quiz';

export interface UserWithAlias extends User {
  alias: string;
}

export type GameStatus = 'waiting' | 'in-progress' | 'finished';

export interface Game {
  id: string;
  quiz: Quiz;
  createdAt: Date;
  players: UserWithAlias[];
  status: GameStatus;
  entryCode: string;
  currentQuestionIndex: number;
  currentQuestionStatus: 'in-progress' | 'done';
}
