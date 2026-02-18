import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  collection,
  collectionData,
  doc,
  Firestore,
} from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { setDoc } from 'firebase/firestore';

export interface UserWithAlias extends User {
  alias: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private firestore = inject(Firestore);

  usersCollection = collection(this.firestore, 'users');

  create(user: UserWithAlias) {
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      alias: user.alias,
    });
  }

  getAll() {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserWithAlias[]>;
  }
}
