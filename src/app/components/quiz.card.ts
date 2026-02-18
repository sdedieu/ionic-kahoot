import { Component, input } from '@angular/core';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Quiz } from '../models/quiz';
import { RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { playOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'quiz-card',
  template: `
    @let quiz = this.quiz();
    <ion-card [routerLink]="'/quiz/' + quiz.id">
      <ion-card-header>
        <ion-card-title>
          {{ quiz.title | titlecase }}
          <ion-button class="ion-float-right" (click)="createGame($event)">
            <ion-icon slot="icon-only" name="play-outline"></ion-icon>
          </ion-button>
        </ion-card-title>
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
    IonButton,
    IonIcon,
    RouterLink,
    TitleCasePipe,
  ],
})
export class QuizCard {
  readonly quiz = input.required<Quiz>();

  constructor() {
    addIcons({ playOutline });
  }

  async createGame(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }
}
