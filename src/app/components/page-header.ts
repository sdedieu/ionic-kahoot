import { Component, inject, input } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'page-header',
  template: `
    <ion-header [translucent]="translucent()" [collapse]="collapse()">
      <ion-toolbar>
        <ion-title> <ng-content /> </ion-title>

        @if (connectedUser()) {
          <ion-buttons slot="end">
            <ion-button shape="round" (click)="logout()">
              <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        }
      </ion-toolbar>
    </ion-header>
  `,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonTitle, IonIcon],
})
export class PageHeader {
  readonly translucent = input<boolean>();
  readonly collapse = input<'condense' | 'fade' | undefined>(undefined);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly connectedUser = toSignal(this.authService.getConnectedUser());

  constructor() {
    addIcons({ logOutOutline });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
