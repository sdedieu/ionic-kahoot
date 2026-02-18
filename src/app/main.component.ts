import { Component } from '@angular/core';
import {
  IonIcon,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gameControllerOutline, playCircle } from 'ionicons/icons';

@Component({
  selector: 'app-main',
  template: `<ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="quizzes">
        <ion-icon name="play-circle"></ion-icon>
        Quiz
      </ion-tab-button>
      <ion-tab-button tab="join-game">
        <ion-icon name="game-controller-outline"></ion-icon>
        Join Game
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>`,
  imports: [IonIcon, IonTabBar, IonTabButton, IonTabs],
})
export class Main {
  constructor() {
    addIcons({ gameControllerOutline, playCircle });
  }
}
