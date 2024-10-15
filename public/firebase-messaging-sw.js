/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyC3VstjYUdmYUMuqy2xDFeGfv5P3ys01jQ",
  authDomain: "mercuryfire-618cd.firebaseapp.com",
  projectId: "mercuryfire-618cd",
  storageBucket: "mercuryfire-618cd.appspot.com",
  messagingSenderId: "82407845910",
  appId: "1:82407845910:web:5f34186d6d937c6db40537",
  measurementId: "G-W8WVXXWT0G"
});

const messaging = firebase.messaging();
if (messaging) {
  console.log("firebase-messaging-sw => firebase messaging is working!!!");
  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "/icon.png"
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// 參考: https://www.darrelltw.com/firebase_notification_click_any_link/
self.addEventListener("notificationclick", function(event) {
  console.log("notificationclick", event);
  event.notification.close(); // 關閉通知

  const { notification } = event;
  if (notification) {
    const url = new URL("/emergency/fireCrewOperations", self.location.origin).href;

    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((windowClients) => {
        // 檢查是否已經有一個窗口/標籤頁打開了目標 URL
        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            // 如果有，則只需將焦點轉到該窗口。
            if (client.url === url && "focus" in client) return client.focus();
        }

        // 如果沒有，則在新窗口/標籤頁中打開目標 URL。
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
    )
  }
}, false);
