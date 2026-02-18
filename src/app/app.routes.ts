import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './services/auth.service';

const isAuthenticated = () => {
  const _authService = inject(AuthService);
  const _router = inject(Router);
  return _authService.getConnectedUser().pipe(
    map((user) => {
      if (!user) _router.navigateByUrl('/login');
      return !!user;
    }),
  );
};

export const routes: Routes = [
  {
    path: '',
    canActivate: [isAuthenticated],
    loadComponent: () => import('./main.component').then((m) => m.Main),
    children: [
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./quiz/quiz-list.page').then((m) => m.QuizListPage),
      },
      {
        path: 'quiz/:quizId',
        loadComponent: () => import('./quiz/quiz.page').then((m) => m.QuizPage),
      },
      {
        path: 'games',
        loadComponent: () =>
          import('./game/game-list.page').then((m) => m.GameListPage),
      },
      {
        path: 'join-game',
        loadComponent: () =>
          import('./game/join-game.page').then((m) => m.JoinGamePage),
      },
      {
        path: 'game/:gameId',
        loadComponent: () => import('./game/game.page').then((m) => m.GamePage),
      },
      {
        path: '',
        redirectTo: 'quizzes',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'password-retrieve',
    loadComponent: () =>
      import('./auth/password-retrieve/password-retrieve.page').then(
        (m) => m.PasswordRetrievePage,
      ),
  },
  {
    path: '',
    redirectTo: '/quizzes',
    pathMatch: 'full',
  },
];
