import { signIn, signUp } from '@/lib/auth';

// The only place the new auth pages talk to your auth code in '@/lib/auth'.
export async function signInWithEmail(email: string, password: string) {
  await signIn(email, password);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  await signUp(name, email, password);
}

// A full reload lets useSession pick up the new session, same as logout does.
export function goToApp() {
  window.location.assign('/');
}