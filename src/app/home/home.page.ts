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
  IonButton,
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz';
import { QuizCard } from '../components/quiz.card';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { CreateQuizModal } from '../modals/create-quiz.modal';

@Component({
  selector: 'home',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title> Home </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Home</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        @let quizzes = this.quizzes.value();
        <ion-grid>
          <ion-row class="ion-justify-content-center ion-align-items-center">
            @for (quiz of quizzes; track quiz.id) {
            <ion-col>
              <quiz-card [quiz]="quiz" />
            </ion-col>
            } @empty {
            <ion-col class="ion-text-center">
              No quiz created yet,
              <a (click)="openCreateQuizModal()">Create your first one</a>
            </ion-col>
            }
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
    <ion-fab slot="fixed" horizontal="end" vertical="bottom">
      <ion-fab-button (click)="openCreateQuizModal()">
        <ion-icon name="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>
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
    QuizCard,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class HomePage {
  private readonly quizService = inject(QuizService);
  private readonly modalCtrl = inject(ModalController);

  protected readonly quizzes = rxResource({
    stream: () => this.quizService.getAll(),
  });

  constructor() {
    addIcons({ add });
  }

  async openCreateQuizModal() {
    const modalRef = await this.modalCtrl.create({
      component: CreateQuizModal,
      cssClass: 'fullscreen-modal',
    });

    modalRef.present();
    const eventDetails = await modalRef.onDidDismiss();
    if (eventDetails.data) {
      this.quizService.setQuiz(eventDetails.data);
    }
  }
}
