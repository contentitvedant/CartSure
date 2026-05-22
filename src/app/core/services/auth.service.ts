import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, authState, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Listen natively to Firebase Auth JWT validations
    authState(this.auth).subscribe(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        // If we already have a user in the subject, don't re-fetch unless it's a different user
        if (this.currentUserSubject.value?.id === firebaseUser.uid) return;

        const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          this.currentUserSubject.next(userDoc.data() as User);
        } else {
          // Only auto-create if we aren't in the middle of a signup process
          // (Wait a bit to see if signup logic creates it)
          setTimeout(async () => {
            const reCheck = await getDoc(userRef);
            if (!reCheck.exists()) {
              const userData: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email!,
                name: firebaseUser.email!.split('@')[0],
                createdAt: new Date()
              };
              await setDoc(userRef, userData);
              this.currentUserSubject.next(userData);
            } else {
              this.currentUserSubject.next(reCheck.data() as User);
            }
          }, 1000);
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => {
        return from(getDoc(doc(this.firestore, `users/${credential.user.uid}`))).pipe(
          map(userDoc => {
            const userData = userDoc.exists() 
              ? userDoc.data() as User 
              : {
                  id: credential.user.uid,
                  email: credential.user.email!,
                  name: credential.user.email!.split('@')[0]
                } as User;
            this.currentUserSubject.next(userData);
            return userData;
          })
        );
      }),
      catchError(error => throwError(() => new Error(this.getReadableError(error))))
    );
  }

  signup(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(credential => {
        const userData: User = {
          id: credential.user.uid,
          email: credential.user.email!,
          name: credential.user.email!.split('@')[0],
          createdAt: new Date()
        };
        return from(setDoc(doc(this.firestore, `users/${credential.user.uid}`), userData)).pipe(
          map(() => {
            this.currentUserSubject.next(userData);
            return userData;
          })
        );
      }),
      catchError(error => throwError(() => new Error(this.getReadableError(error))))
    );
  }

  logout() {
    signOut(this.auth).then(() => {
      this.currentUserSubject.next(null);
    });
  }
  
  private getReadableError(error: any): string {
    const code = error.code || error.message;
    switch (code) {
      case 'auth/invalid-email': return 'The email address is badly formatted.';
      case 'auth/user-disabled': return 'This user account has been disabled.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please check your credentials.';
      case 'auth/email-already-in-use': return 'An account already exists with this email address.';
      case 'auth/weak-password': return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/network-request-failed': return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later.';
      case 'auth/operation-not-allowed': return 'Email/password accounts are not enabled. Contact support.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  }
}
