import { Component, inject, input, signal } from '@angular/core';
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
  IonButton,
  IonItem,
  IonCard,
  IonCardContent,
  IonInput,
  ToastController,
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz.service';
import { QuizCard } from '../components/quiz.card';
import { addIcons } from 'ionicons';
import { add, paperPlaneOutline } from 'ionicons/icons';
import { CreateQuizModal } from '../modals/create-quiz.modal';
import { GameService } from '../services/game.service';
import { GameCard } from '../components/game.card';
import { Field, form, pattern, required } from '@angular/forms/signals';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'join-game',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Join Game </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large"> Join Game </ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <form (submit)="confirm($event)" novalidate>
          <ion-grid>
            <ion-row>
              <ion-col offset="2" size="8">
                <ion-card>
                  <ion-card-content>
                    <ion-item>
                      <ion-input
                        aria-label="Enter the game entry code"
                        [field]="entryGameForm.code"
                        placeholder="Game entry code"
                      ></ion-input>
                      <ion-button slot="end" type="submit">
                        <ion-icon
                          slot="icon-only"
                          name="paper-plane-outline"
                        ></ion-icon>
                      </ion-button>
                    </ion-item>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </form>
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
    IonCard,
    IonCardContent,
    IonItem,
    IonButton,
    IonIcon,
    IonInput,
    Field,
  ],
})
export class JoinGamePage {
  private readonly gameService = inject(GameService);
  private readonly authService = inject(AuthService);
  private readonly toastController = inject(ToastController);
  private readonly router = inject(Router);

  entryGame = signal({ code: '' });

  constructor() {
    addIcons({ paperPlaneOutline });
  }

  entryGameForm = form(this.entryGame, (schemaPath) => {
    required(schemaPath.code, { message: 'Code is required' });
    pattern(schemaPath.code, /^[A-Z]{6}$/, { message: 'Code is invalid' });
  });

  async confirm(event: Event) {
    let toast: HTMLIonToastElement | undefined;
    event.preventDefault();
    try {
      const user = await firstValueFrom(this.authService.getConnectedUser());
      const game = await this.gameService.join(this.entryGame().code, user!);
      toast = await this.toastController.create({
        message: `Successfully joined game ${game.quiz?.title}`,
        duration: 1500,
      });
      this.router.navigateByUrl(`/game/${game.id}`);
    } catch (e) {
      console.error(e);
      toast = await this.toastController.create({
        message: `Could not join game`,
        duration: 1500,
      });
    } finally {
      await toast?.present();
    }
  }
}
