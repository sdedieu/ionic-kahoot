import { Component, inject, input } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { playOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GameService } from '../services/game.service';
import { Game } from '../models/game';

@Component({
  selector: 'game-card',
  template: `
    @let game = this.game();
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          {{ game.quiz.title | titlecase }}
        </ion-card-title>
        <ion-card-subtitle> Created: {{ game.createdAt }} </ion-card-subtitle>
      </ion-card-header>
    </ion-card>
  `,
  styles: [``],
  imports: [
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    TitleCasePipe,
  ],
})
export class GameCard {
  readonly game = input.required<Game>();
}
