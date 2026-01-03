import { Component, inject, input, linkedSignal, signal } from '@angular/core';
import {
  applyEach,
  Field,
  form,
  required,
  SchemaPathTree,
  validate,
} from '@angular/forms/signals';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonInput,
  IonList,
  IonTextarea,
  ModalController,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonRadio,
  IonRadioGroup,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { Choice } from '../models/choice';
import { Question } from '../models/question';
import { addIcons } from 'ionicons';
import { removeOutline } from 'ionicons/icons';
import { QuizService } from '../services/quiz';

function ChoiceSchema(choice: SchemaPathTree<Choice>) {
  required(choice.text, { message: 'Choice text is required' });
}

function QuestionSchema(question: SchemaPathTree<Question>) {
  required(question.text, { message: 'Question text is required' });
  validate(question.correctChoiceId, ({ value, valueOf }) => {
    if (!valueOf(question.choices).find((c) => c.id === value())) {
      return {
        kind: 'no-correct-choice',
        message: 'At least one choice must be marked as correct',
      };
    }
    return null;
  });
  applyEach(question.choices, ChoiceSchema);
}

@Component({
  selector: 'create-quiz-modal',
  template: `
    <form id="createQuizForm" (submit)="confirm($event)">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button
              data-testid="cancel-create-quiz-button"
              color="medium"
              (click)="cancel()"
            >
              Cancel
            </ion-button>
          </ion-buttons>
          <ion-title>
            <ion-input
              aria-label="Enter the quiz title"
              [field]="quizForm.title"
              placeholder="Guess the capital city"
            ></ion-input>
          </ion-title>
          <ion-buttons slot="end">
            <ion-button
              data-testid="confirm-create-quiz-button"
              type="submit"
              form="createQuizForm"
              [strong]="true"
              [disabled]="quizForm().invalid()"
            >
              Confirm
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding" [fullscreen]="true">
        <ion-list>
          <ion-item>
            <ion-textarea
              labelPlacement="stacked"
              label="Enter the quiz description"
              [field]="quizForm.description"
              placeholder="Guess the capital city of various countries around the world."
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-grid>
          <ion-row>
            @for (question of quizForm.questions; track $index) {
            <ion-col size="12">
              <ion-card>
                <ion-button
                  fill="clear"
                  color="medium"
                  class="ion-float-end"
                  (click)="removeQuestion(question().value().id)"
                >
                  <ion-icon name="remove-outline"></ion-icon>
                </ion-button>
                <ion-card-header>
                  <ion-card-title>
                    <ion-input
                      aria-label="Enter the question text"
                      [field]="question.text"
                      placeholder="Question"
                    ></ion-input>
                  </ion-card-title>
                </ion-card-header>
                <ion-card-content>
                  <ion-radio-group [field]="question.correctChoiceId">
                    <ion-list lines="none">
                      <ion-item>
                        <ion-label>Choices</ion-label>
                        <ion-label slot="end">Correct</ion-label>
                      </ion-item>
                      @for (choice of question.choices; track $index; let first
                      = $first) {
                      <ion-item>
                        <ion-input
                          aria-label="Enter the choice text"
                          [field]="choice.text"
                          placeholder="Choice"
                        ></ion-input>
                        <ion-radio
                          slot="end"
                          [value]="choice().value().id"
                        ></ion-radio>
                        @if(!first) {
                        <ion-button
                          fill="clear"
                          slot="end"
                          color="medium"
                          (click)="
                            removeChoice(
                              question().value().id,
                              choice().value().id
                            )
                          "
                        >
                          <ion-icon name="remove-outline"></ion-icon>
                        </ion-button>
                        } @else {
                        <span slot="end" style="width: 2rem;"></span>
                        }
                      </ion-item>
                      }
                    </ion-list>
                  </ion-radio-group>
                  <ion-button
                    (click)="addChoice(question().value().id)"
                    expand="full"
                    >Add choice
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </ion-col>
            }
          </ion-row>
        </ion-grid>
        <ion-button (click)="addQuestion()" expand="full">
          Add question
        </ion-button>
      </ion-content>
    </form>
  `,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonInput,
    Field,
    IonList,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonRadio,
    IonRadioGroup,
    IonLabel,
    IonIcon,
  ],
})
export class CreateQuizModal {
  private readonly modalCtrl = inject(ModalController);
  private readonly quizService = inject(QuizService);

  constructor() {
    addIcons({ removeOutline });
  }

  quiz = input<Quiz>();

  _quiz = linkedSignal(() => this.quiz() ?? this.quizService.generateQuiz());

  quizForm = form(this._quiz, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    applyEach(schemaPath.questions, QuestionSchema);
  });

  addQuestion() {
    const newQuestionId = this.quizService.generateQuestionId(this._quiz().id);
    const newChoiceId = this.quizService.generateChoiceId(
      this._quiz().id,
      newQuestionId
    );
    const newQuestion: Question = {
      id: newQuestionId,
      text: '',
      choices: [{ id: newChoiceId, text: '' }],
      correctChoiceId: newChoiceId,
    };
    this._quiz.update((q) => ({
      ...q,
      questions: [...q.questions, newQuestion],
    }));
    this.quizForm().markAsDirty();
  }

  removeQuestion(questionId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.filter((question) => question.id !== questionId),
    }));
    this.quizForm().markAsDirty();
  }

  addChoice(questionId: string) {
    const newChoiceId = this.quizService.generateChoiceId(
      this._quiz().id,
      questionId
    );

    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id === questionId) {
          return {
            ...question,
            choices: [...question.choices, { id: newChoiceId, text: '' }],
          };
        }
        return question;
      }),
    }));
    this.quizForm().markAsDirty();
  }

  removeChoice(questionId: string, choiceId: string) {
    this._quiz.update((q) => ({
      ...q,
      questions: q.questions.map((question) => {
        if (question.id === questionId) {
          const updatedChoices = question.choices.filter(
            (choice) => choice.id !== choiceId
          );
          let updatedCorrectChoiceId = question.correctChoiceId;
          if (question.correctChoiceId === choiceId) {
            updatedCorrectChoiceId =
              updatedChoices.length > 0 ? updatedChoices[0].id : '';
          }
          return {
            ...question,
            choices: updatedChoices,
            correctChoiceId: updatedCorrectChoiceId,
          };
        }
        return question;
      }),
    }));
    this.quizForm().markAsDirty();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  confirm(event: Event) {
    event.preventDefault();
    if (this.quizForm().invalid()) {
      return;
    }
    const quizFormValue = this.quizForm().value();

    this.modalCtrl.dismiss(quizFormValue);
  }
}
