import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, Field, required, FieldTree } from '@angular/forms/signals';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonTextarea,
  IonList,
  IonItem,
  IonInput,
  IonItemSliding,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonButtons,
  IonButton,
  IonFab,
  IonFabButton,
  ModalController,
  ActionSheetController,
  PopoverController,
  IonPopover,
} from '@ionic/angular/standalone';
import { QuizService } from '../services/quiz.service';

import { addIcons } from 'ionicons';
import {
  trashOutline,
  saveOutline,
  add,
  ellipsisVerticalOutline,
  createOutline,
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { Quiz } from '../models/quiz';
import { CreateQuizModal } from '../modals/create-quiz.modal';

@Component({
  selector: 'quiz-options-popover',
  template: `
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button (click)="delete()" color="danger">
          <ion-icon slot="start" name="trash-outline"></ion-icon>
          <ion-label>Delete</ion-label>
        </ion-item>
        <ion-item button (click)="edit()">
          <ion-icon slot="start" name="create-outline"></ion-icon>
          <ion-label>Edit</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  imports: [IonContent, IonList, IonItem, IonIcon, IonLabel],
})
export class QuizOptionsPopover {
  popoverCtrl = inject(PopoverController);

  constructor() {
    addIcons({ createOutline, trashOutline });
  }

  delete() {
    this.popoverCtrl.dismiss({ action: 'delete' });
  }

  edit() {
    this.popoverCtrl.dismiss({ action: 'edit' });
  }
}

@Component({
  selector: 'quiz-page-toolbar',
  template: `
    <ion-toolbar>
      <ion-title>
        <ion-list lines="none">
          <ion-item>
            <ion-input
              aria-label="Title"
              [field]="quizForm().title"
              placeholder="Enter the quiz title here"
            ></ion-input>
          </ion-item>
        </ion-list>
      </ion-title>
      <ion-buttons slot="end">
        <ion-button
          id="open-options"
          color="medium"
          (click)="openOptions($event)"
        >
          <ion-icon name="ellipsis-vertical-outline"></ion-icon>
        </ion-button>

        @if (quizForm()().dirty()) {
          <ion-button form="quizForm" type="submit">
            Save <ion-icon slot="end" name="save-outline"></ion-icon>
          </ion-button>
        }
      </ion-buttons>
    </ion-toolbar>
  `,
  imports: [
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonInput,
    IonButtons,
    IonButton,
    IonIcon,
    Field,
  ],
})
export class QuizPageToolbar {
  popoverCtrl = inject(PopoverController);
  quizForm = input.required<FieldTree<Quiz, string | number>>();

  delete = output<void>();
  edit = output<void>();

  constructor() {
    addIcons({ ellipsisVerticalOutline, trashOutline });
  }

  async openOptions(event: Event) {
    const popover = await this.popoverCtrl.create({
      component: QuizOptionsPopover,
      event,
      translucent: true,
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data?.action === 'delete') {
      this.delete.emit();
    } else if (data?.action === 'edit') {
      this.edit.emit();
    }
  }
}

@Component({
  selector: 'quiz',
  template: `
    @let quiz = this.quiz();
    <ion-header [translucent]="true">
      <quiz-page-toolbar
        [quizForm]="quizForm"
        (delete)="deleteQuiz()"
        (edit)="editQuiz()"
      />
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <quiz-page-toolbar
          [quizForm]="quizForm"
          (delete)="deleteQuiz()"
          (edit)="editQuiz()"
        />
      </ion-header>

      <div id="container">
        <ion-list lines="none">
          <ion-item>
            <ion-textarea
              aria-label="Description"
              [field]="quizForm.description"
              placeholder="Enter the quiz description here"
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-list lines="none">
          @for (question of quiz.questions; track $index) {
            <ion-item>
              <ion-label>{{ question.text }} </ion-label>
            </ion-item>
          }
        </ion-list>
      </div>
    </ion-content>
  `,
  styles: [``],
  imports: [
    IonHeader,
    IonContent,
    IonTextarea,
    IonList,
    IonItem,
    IonLabel,
    Field,
    QuizPageToolbar,
  ],
})
export class QuizPage {
  private readonly quizService = inject(QuizService);
  private readonly modalCtrl = inject(ModalController);
  private readonly actionSheetCtrl = inject(ActionSheetController);
  private readonly router = inject(Router);

  readonly id = input.required<string>({ alias: 'quizId' });

  protected readonly quizResource = rxResource({
    stream: ({ params }) => this.quizService.getById(params.id),
    params: () => ({ id: this.id() }),
    defaultValue: {
      id: '',
      title: '',
      description: '',
      questions: [],
    },
  });

  protected readonly quizForm = form(this.quizResource.value, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
  });

  quiz = computed(() => this.quizResource.value());

  constructor() {
    addIcons({ trashOutline, saveOutline, add });
  }

  async openCreateQuestionModal() {}

  async updateQuiz(event: Event) {
    event.preventDefault();
    const quizFormValue = this.quizForm().value();
    await this.quizService.setQuiz(quizFormValue);
    this.quizForm().reset();
  }

  async editQuiz() {
    const modalRef = await this.modalCtrl.create({
      component: CreateQuizModal,
      componentProps: { quiz: this.quiz },
      cssClass: 'fullscreen-modal',
    });

    modalRef.present();
    const eventDetails = await modalRef.onDidDismiss();
    if (eventDetails.data) {
      this.quizService.setQuiz(eventDetails.data);
    }
  }

  async deleteQuiz() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Yes',
          role: 'confirm',
        },
        {
          text: 'No',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    if (role === 'confirm') {
      await this.quizService.deleteQuiz(this.id());
      this.router.navigateByUrl('/');
    }
  }
}
