import { Component, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz.service';
import { QuizCard } from '../components/quiz.card';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CreateQuizModal } from '../modals/create-quiz.modal';
import { GameService } from '../services/game.service';
import { GameCard } from '../components/game.card';

@Component({
  selector: 'game-list',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Games </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Games</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        @let games = this.games.value();
        <ion-grid>
          <ion-row class="ion-justify-content-center ion-align-items-center">
            @for (game of games; track game.id) {
              <ion-col>
                <game-card [game]="game" />
              </ion-col>
            }
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  `,
  styles: [``],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    GameCard,
  ],
})
export class GameListPage {
  private readonly gameService = inject(GameService);

  protected readonly games = rxResource({
    stream: () => this.gameService.getAll(),
  });
}
