import { inject, Injectable } from '@angular/core';
import {
  Auth,
  User,
  user,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { UserService } from './user.service';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  getConnectedUser(): Observable<User | null> {
    return user(this.auth);
  }

  async register(
    email: string,
    password: string,
    alias: string,
  ): Promise<void> {
    const userCred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password,
    );
    await this.userService.create({ alias, ...userCred.user });
    await sendEmailVerification(userCred.user);
    return this.logout();
  }

  async login(email: string, password: string): Promise<void> {
    let toast: HTMLIonToastElement | undefined;
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigateByUrl('/');
      toast = await this.toastController.create({
        message: `Login successful`,
        duration: 1500,
      });
    } catch (error) {
      console.error(error);
      toast = await this.toastController.create({
        message: `Something wrong happened during login`,
        duration: 1500,
      });
    } finally {
      await toast?.present();
    }
  }

  async signInWithGoogle() {
    await FirebaseAuthentication.signInWithGoogle();

    this.router.navigateByUrl('/');
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigateByUrl('/');
  }

  sendResetPasswordLink(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }
}
