import { Component, input } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'quiz-card',
  template: `
    @let quiz = this.quiz();
    <ion-card [routerLink]="'/quiz/' + quiz.id">
      <ion-card-header>
        <ion-card-title>{{ quiz.title | titlecase }}</ion-card-title>
        <ion-card-subtitle>
          Questions: {{ quiz.questionsCount }}
        </ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        {{ quiz.description }}
      </ion-card-content>
    </ion-card>
  `,
  styles: [``],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    RouterLink,
    TitleCasePipe,
  ],
})
export class QuizCard {
  readonly quiz = input.required<Quiz>();
}
