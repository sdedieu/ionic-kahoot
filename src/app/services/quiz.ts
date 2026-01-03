import { inject, Injectable } from '@angular/core';
import { Question } from '../models/question';
import { Choice } from '../models/choice';
import {
  BehaviorSubject,
  combineLatest,
  map,
  mergeMap,
  Observable,
  switchMap,
  tap,
} from 'rxjs';
import { Quiz } from '../models/quiz';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  collectionCount,
  setDoc,
  writeBatch,
  deleteDoc,
  getDocs,
} from '@angular/fire/firestore';

const mockedQuizzes: Quiz[] = [
  {
    id: 'quiz1',
    title: 'Sample Quiz',
    description: 'This is a sample quiz description.',
    questions: [
      {
        id: 'q1',
        text: 'What is the capital of France?',
        choices: [
          { id: 'c1', text: 'Berlin' },
          { id: 'c2', text: 'Madrid' },
          { id: 'c3', text: 'Paris' },
          { id: 'c4', text: 'Rome' },
        ],
        correctChoiceId: 'c3',
      },
      {
        id: 'q2',
        text: 'What is 2 + 2?',
        choices: [
          { id: 'c1', text: '3' },
          { id: 'c2', text: '4' },
          { id: 'c3', text: '5' },
          { id: 'c4', text: '22' },
        ],
        correctChoiceId: 'c2',
      },
    ],
  },
  {
    id: 'quiz2',
    title: 'Another Sample Quiz',
    description: 'This is another sample quiz description.',
    questions: [],
  },
  {
    id: 'quiz3',
    title: 'Another Quiz',
    description: 'This is another quiz description.',
    questions: [],
  },
];

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private firestore: Firestore = inject(Firestore); // inject Cloud Firestore

  getAll(): Observable<Quiz[]> {
    // get a reference to the quizzes collection
    const quizzesCollection = collection(this.firestore, 'quizzes');

    // get documents (data) from the collection using collectionData
    const quizzesCollectionData = collectionData(quizzesCollection, {
      idField: 'id',
    }) as Observable<Quiz[]>;

    return quizzesCollectionData.pipe(
      mergeMap((quizzes) =>
        combineLatest(
          quizzes.map((quiz) =>
            collectionCount(quizzesCollection).pipe(
              map((count) => ({
                ...quiz,
                questionsCount: count,
              }))
            )
          )
        )
      )
    );
  }

  getById(id: string) {
    // get a reference to the quiz doc
    const quizDoc = doc(this.firestore, `quizzes/${id}`);

    // get document (data) from the doc using docData
    const quizData = docData(quizDoc, {
      idField: 'id',
    }) as Observable<Quiz>;

    return quizData.pipe(
      switchMap((quiz) => this.assembleQuiz(quiz)),
      tap(console.log)
    ) as Observable<Quiz>;
  }

  private assembleQuiz(quiz: Quiz): Observable<Quiz> {
    return (
      collectionData(
        collection(doc(this.firestore, `quizzes/${quiz.id}`), 'questions'),
        {
          idField: 'id',
        }
      ) as Observable<Question[]>
    ).pipe(
      mergeMap((questions) =>
        combineLatest(
          questions.map((question) => this.assembleQuestion(quiz.id, question))
        )
      ),
      map((questions) => ({
        ...quiz,
        questions: questions,
      }))
    );
  }

  private assembleQuestion(
    quizId: string,
    question: Question
  ): Observable<Question> {
    return (
      collectionData(
        collection(
          doc(this.firestore, `quizzes/${quizId}/questions/${question.id}`),
          'choices'
        ),
        {
          idField: 'id',
        }
      ) as Observable<Choice[]>
    ).pipe(
      map((choices) => ({
        ...question,
        choices: choices,
      }))
    );
  }

  async setQuiz(quiz: Quiz): Promise<void> {
    const batch = writeBatch(this.firestore);

    // Quiz (auto ID or provided ID — your choice)
    const quizRef = doc(this.firestore, 'quizzes', quiz.id);

    batch.set(quizRef, {
      title: quiz.title,
      description: quiz.description,
    });

    const existingQuestions = await getDocs(collection(quizRef, 'questions'));

    for (const questionSnap of existingQuestions.docs) {
      const choicesSnap = await getDocs(
        collection(questionSnap.ref, 'choices')
      );

      for (const choice of choicesSnap.docs) {
        batch.delete(choice.ref);
      }

      batch.delete(questionSnap.ref);
    }

    for (const question of quiz.questions) {
      const questionRef = doc(
        this.firestore,
        `quizzes/${quiz.id}/questions/${question.id}`
      );

      for (const choice of question.choices) {
        const choiceRef = doc(
          this.firestore,
          `quizzes/${quiz.id}/questions/${question.id}/choices/${choice.id}`
        );

        batch.set(choiceRef, {
          text: choice.text,
        });
      }

      batch.set(questionRef, {
        text: question.text,
        correctChoiceId: question.correctChoiceId,
      });
    }

    await batch.commit();
  }

  deleteQuiz(quizId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, `quizzes/${quizId}`));
  }

  generateQuizId(): string {
    return doc(collection(this.firestore, 'quizzes')).id;
  }

  generateQuestionId(quizId: string): string {
    const quizRef = doc(this.firestore, `quizzes/${quizId}`);
    return doc(collection(quizRef, 'questions')).id;
  }

  generateChoiceId(quizId: string, questionId: string): string {
    const questionRef = doc(
      this.firestore,
      `quizzes/${quizId}/questions/${questionId}`
    );
    return doc(collection(questionRef, 'choices')).id;
  }

  generateQuiz() {
    const quizId = this.generateQuizId();
    const questionId = this.generateQuestionId(quizId);
    const correctChoiceId = this.generateChoiceId(quizId, questionId);
    return {
      id: quizId,
      title: 'Guess the Capital City',
      description: 'A fun quiz to test your knowledge of world capitals.',
      questions: [
        {
          id: questionId,
          text: 'What is the capital of France?',
          choices: [
            { id: correctChoiceId, text: 'Paris' },
            { id: this.generateChoiceId(quizId, questionId), text: 'London' },
            { id: this.generateChoiceId(quizId, questionId), text: 'Berlin' },
            { id: this.generateChoiceId(quizId, questionId), text: 'Madrid' },
          ],
          correctChoiceId: correctChoiceId,
        },
      ],
    };
  }
}
