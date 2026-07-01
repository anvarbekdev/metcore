self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data || {},
    actions: [
      { action: 'view', title: 'Ko\'rish' },
      { action: 'dismiss', title: 'Yopish' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'MedERP', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/dashboard'));
  }
});
