import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import {
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonInput,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-password-retrieve',
  template: ` <form [formGroup]="passwordRetrieveForm" (ngSubmit)="onSubmit()">
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Retrieve Password</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Retrieve Password</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-input
        formControlName="email"
        fill="solid"
        label="Email"
        labelPlacement="floating"
        placeholder="user@gmail.com"
        type="email"
        [errorText]="invalidEmailText"
      ></ion-input>
      <ion-button expand="block" type="submit">Send email</ion-button>
    </ion-content>
  </form>`,
  imports: [
    IonButton,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonInput,
    CommonModule,
    ReactiveFormsModule,
  ],
})
export class PasswordRetrievePage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  invalidEmailText = 'Not a valid email';

  passwordRetrieveForm = this.fb.group({
    email: ['', Validators.email],
  });

  onSubmit() {
    this.authService.sendResetPasswordLink(
      this.passwordRetrieveForm.value.email!
    );
  }
}
