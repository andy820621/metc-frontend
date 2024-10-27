// src-pwa/register-service-worker.js file

import { register } from 'register-service-worker';

register(process.env.SERVICE_WORKER_FILE, {
  ready(registration) {
    console.log('Service worker is active.', registration);
  },

  registered(registration) {
    console.log('Service worker has been registered.', registration);
  },

  cached(registration) {
    console.log('Content has been cached for offline use.', registration);
  },

  updatefound(registration) {
    console.log('New content is downloading.', registration);
  },

  updated(registration) {
    console.log('New content is available; please refresh.', registration);
  },

  offline() {
    console.log(
      'No internet connection found. App is running in offline mode.'
    );
  },

  error(error) {
    console.error('Error during service worker registration:', error);
  },
});
