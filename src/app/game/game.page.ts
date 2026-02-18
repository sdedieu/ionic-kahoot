import {
  Component,
  computed,
  effect,
  inject,
  input,
  Pipe,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz.service';
import { QuizCard } from '../components/quiz.card';
import { addIcons } from 'ionicons';
import { triangle, star, square, ellipse, play } from 'ionicons/icons';
import { CreateQuizModal } from '../modals/create-quiz.modal';
import { GameService } from '../services/game.service';
import { GameCard } from '../components/game.card';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { doc, Firestore } from '@angular/fire/firestore';

@Pipe({
  name: 'choiceColor',
})
export class ChoiceColorPipe {
  transform(idx: number) {
    switch (idx) {
      case 0:
        return 'primary';
      case 1:
        return 'warning';
      case 2:
        return 'success';
      case 3:
        return 'danger';
      default:
        return 'primary';
    }
  }
}

@Pipe({
  name: 'choiceSymbol',
})
export class ChoiceSymbolPipe {
  transform(idx: number) {
    switch (idx) {
      case 0:
        return 'ellipse';
      case 1:
        return 'square';
      case 2:
        return 'star';
      case 3:
        return 'triangle';
      default:
        return 'square';
    }
  }
}

@Pipe({
  name: 'gameStatus',
})
export class GameStatusPipe {
  transform(value: string) {
    switch (value) {
      case 'waiting':
        return 'Waiting for other players';
      case 'in-progress':
        return 'In Progress';
      case 'finished':
        return 'Finished';
      default:
        return value;
    }
  }
}

@Component({
  selector: 'game',
  template: `
    @let game = this.game.value();
    @let players = this.game.value()?.players;
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> {{ game?.quiz?.title }} </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ game?.quiz?.title }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <ion-grid>
          @switch (game?.status) {
            @case ('waiting') {
              <ion-row
                class="ion-justify-content-center ion-align-items-center"
              >
                <ion-col class="ion-text-center">
                  <div>
                    Entry code: <strong>{{ game?.entryCode }}</strong>
                  </div>
                  <div>
                    Number of players: <strong>{{ players?.length }}</strong>
                  </div>
                  <div>
                    Status:
                    <strong>{{ game?.status ?? '' | gameStatus }}</strong>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row
                class="ion-justify-content-center ion-align-items-center"
              >
                @for (player of players; track player.uid) {
                  <ion-col class="ion-text-center">
                    {{ player.alias }}
                  </ion-col>
                }
              </ion-row>
            }
            @case ('in-progress') {
              @let question = currentQuestion();
              @let choices = question?.choices;
              <ion-row>
                <ion-col size="12" class="ion-text-center">
                  <h1>{{ question?.text }}</h1>
                </ion-col>
              </ion-row>
              @switch (game?.currentQuestionStatus) {
                @case ('in-progress') {
                  <ion-row>
                    @for (choice of choices; track $index; let idx = $index) {
                      <ion-col size="6">
                        <ion-button
                          style="width: 100%; height: 35dvh"
                          [color]="idx | choiceColor"
                          (click)="answerQuestion(idx)"
                          [style.opacity]="
                            playerChoice() >= 0 && playerChoice() !== idx
                              ? 0.5
                              : 1
                          "
                        >
                          <ion-icon
                            slot="start"
                            size="large"
                            color="dark"
                            [name]="idx | choiceSymbol"
                          >
                          </ion-icon
                          ><span
                            style="color: var(--ion-color-dark); font-size: 2rem; font-weigth: 800;"
                            >{{ choice.text }}</span
                          >
                        </ion-button>
                      </ion-col>
                    }
                  </ion-row>
                }
                @case ('done') {
                  <ion-row>
                    <ion-col size="12" class="ion-text-center">
                      <h2>
                        Answer:
                        {{ choices?.[question!.correctChoiceIndex]?.text }}
                      </h2>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    @for (choice of choices; track $index; let idx = $index) {
                      <ion-col [size]="3">
                        <ion-button
                          role="status"
                          style="width: 100%; pointer-events: none;"
                          [style.height.dvh]="50"
                          [style.opacity]="
                            question?.correctChoiceIndex === idx ? 1 : 0.5
                          "
                          [color]="idx | choiceColor"
                        >
                        </ion-button>
                        <ion-button
                          role="status"
                          style="width: 100%; pointer-events: none;"
                          [color]="idx | choiceColor"
                          [style.opacity]="
                            question?.correctChoiceIndex === idx ? 1 : 0.5
                          "
                        >
                          <ion-icon
                            size="large"
                            color="dark"
                            [name]="idx | choiceSymbol"
                          >
                          </ion-icon>
                        </ion-button>
                      </ion-col>
                    }
                  </ion-row>
                }
                @default {}
              }
            }
            @case ('finished') {
              <ion-row
                class="ion-justify-content-center ion-align-items-center"
              >
                <ion-col size="12" class="ion-text-center">
                  <h1>Finished</h1>
                </ion-col>
              </ion-row>
            }
            @default {}
          }
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
    IonButton,
    IonIcon,
    GameStatusPipe,
    ChoiceSymbolPipe,
    ChoiceColorPipe,
  ],
})
export class GamePage {
  readonly gameId = input.required<string>();

  private readonly gameService = inject(GameService);
  private readonly authService = inject(AuthService);
  private firestore: Firestore = inject(Firestore); // inject Cloud Firestore

  player = toSignal(this.authService.getConnectedUser());

  protected readonly game = rxResource({
    stream: () => this.gameService.getById(this.gameId()),
  });

  eff = effect(() => console.log(this.playerChoice()));

  currentQuestion = computed(() => {
    const game = this.game.value();
    return game?.quiz.questions[game.currentQuestionIndex] ?? null;
  });

  playerChoice = computed(() => {
    const game = this.game.value();
    const player = this.player();
    if (!game || !player) return -1;

    const choicesArray: any[][] = ['0', '1', '2', '3'].map(
      (choiceIndex) =>
        (game.quiz.questions[game.currentQuestionIndex] as any)[choiceIndex] ??
        [],
    );

    return choicesArray.findIndex((arr) =>
      arr.find((playerRef) => playerRef.path === `users/${player.uid}`),
    );
  });

  constructor() {
    addIcons({ triangle, star, square, ellipse });
  }

  async answerQuestion(choiceIndex: number) {
    const game = this.game.value()!;
    this.gameService.answer(
      game.id,
      this.player()!,
      game.quiz.questions[game.currentQuestionIndex].id,
      choiceIndex,
    );
  }
}
