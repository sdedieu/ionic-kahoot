import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  Firestore,
  addDoc,
  collectionData,
  docData,
  DocumentReference,
  DocumentData,
  setDoc,
  where,
  query,
  getDocs,
  QueryDocumentSnapshot,
  getDoc,
} from '@angular/fire/firestore';
import { Game } from '../models/game';
import { combineLatest, map, mergeMap, Observable, switchMap, tap } from 'rxjs';
import { Quiz } from '../models/quiz';
import { UserWithAlias } from './user.service';
import { User } from '@angular/fire/auth';
import { Question } from '../models/question';

function generateEntryCode(): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export type GameDao = Omit<Game, 'quiz' | 'players'> & {
  quiz: DocumentReference<DocumentData, DocumentData>;
  players: DocumentReference<DocumentData, DocumentData>[];
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private firestore = inject(Firestore);

  gamesCollection = collection(this.firestore, 'games');

  create(quizId: string) {
    return addDoc(this.gamesCollection, {
      quiz: doc(this.firestore, 'quizzes', quizId),
      entryCode: generateEntryCode(),
      status: 'waiting',
      createdAt: new Date(),
    });
  }

  getAll(): Observable<Game[]> {
    return (
      collectionData(this.gamesCollection, { idField: 'id' }) as Observable<
        GameDao[]
      >
    ).pipe(
      mergeMap((games) =>
        combineLatest(
          games.map((game) =>
            (docData(game.quiz, { idField: 'id' }) as Observable<Quiz>).pipe(
              map((quiz) => ({ ...game, quiz, players: [] }) as Game),
            ),
          ),
        ),
      ),
    );
  }

  getById(gameId: string) {
    return (
      docData(doc(this.firestore, 'games', gameId), {
        idField: 'id',
      }) as Observable<GameDao>
    ).pipe(
      mergeMap((game) =>
        combineLatest([
          this._getGameQuiz(game),
          this._getGamePlayers(game),
        ]).pipe(map(([quiz, players]) => ({ ...game, quiz, players }))),
      ),
    );
  }

  private _getGameQuiz(game: GameDao): Observable<Quiz> {
    return (
      docData(game.quiz, {
        idField: 'id',
      }) as Observable<Quiz>
    ).pipe(
      switchMap((quiz) => {
        const gameQuestionCollectionRef = collection(
          this.firestore,
          `games/${game.id}/questions`,
        );
        const questionsCollectionRef = collection(
          this.firestore,
          `quizzes/${quiz.id}/questions`,
        );
        return combineLatest([
          collectionData(gameQuestionCollectionRef, { idField: 'id' }),
          collectionData(questionsCollectionRef, { idField: 'id' }),
        ]).pipe(
          map(
            ([gameQuestion, questions]) =>
              ({
                ...quiz,
                questions: questions.map((q) => ({
                  ...q,
                  ...gameQuestion.find((gq) => q.id === gq.id),
                })),
              }) as Quiz,
          ),
        );
      }),
    );
  }

  private _getGamePlayers(game: GameDao): Observable<UserWithAlias[]> {
    const playersCollectionRef = collection(
      this.firestore,
      `games/${game.id}/players`,
    );
    return collectionData(playersCollectionRef, {
      idField: 'id',
    }) as Observable<UserWithAlias[]>;
  }

  async join(code: string, player: User): Promise<Partial<Game>> {
    const gamesSnapshot = await getDocs(
      query(this.gamesCollection, where('entryCode', '==', code)),
    );
    const game = gamesSnapshot.docs.at(0);
    if (!game) {
      throw new Error('Game not found');
    }
    const quiz = await getDoc((game.data() as GameDao).quiz);
    setDoc(doc(this.firestore, `games/${game.id}/players/${player.uid}`), {
      player: doc(this.firestore, `users/${player.uid}`),
    });
    return { ...game.data, id: game.id, quiz: { ...(quiz.data() as Quiz) } };
  }

  launch(gameId: string) {
    return setDoc(doc(this.firestore, 'games', gameId), {
      status: 'in-progress',
      currentQuestionIndex: 0,
    });
  }

  answer(
    gameId: string,
    player: User,
    questionId: string,
    choiceIndex: number,
  ) {
    const path = `games/${gameId}/questions/${questionId}`;
    return setDoc(doc(this.firestore, path), {
      [choiceIndex]: [doc(this.firestore, `users/${player.uid}`)],
    });
  }

  async revealAnswer(gameId: string) {
    return setDoc(doc(this.firestore, 'games', gameId), {
      currentQuestionStatus: 'done',
    });
  }

  async nextQuestion(gameId: string, questionIndex: number) {
    return setDoc(doc(this.firestore, 'games', gameId), {
      currentQuestionIndex: questionIndex + 1,
    });
  }
}
