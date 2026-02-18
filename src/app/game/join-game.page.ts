import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/angular/standalone';
import { PageHeader } from '../components/page-header';

@Component({
  selector: 'join-game',
  template: `
    <page-header [translucent]="true"> Join Game </page-header>

    <ion-content [fullscreen]="true">
      <page-header collapse="condense"> Join Game </page-header>

      <div id="container"></div>
    </ion-content>
  `,
  styles: [``],
  imports: [IonContent, PageHeader],
})
export class JoinGamePage {}
