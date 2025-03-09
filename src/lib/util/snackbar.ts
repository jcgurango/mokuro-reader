import { writable } from 'svelte/store';

type Snackbar = {
  visible: boolean;
  message: string;
};
export const snackbarStore = writable<Snackbar | undefined>(undefined);

export function showSnackbar(message: string, duration = 3000) {
  snackbarStore.set({
    visible: true,
    message
  });

  if (duration > 0) {
    setTimeout(() => {
      snackbarStore.set(undefined);
    }, duration);
  }
}
