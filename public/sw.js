self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'enter') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          client.postMessage({ type: 'ALARM_ACTION', action: 'enter' });
          return client.focus();
        }
        return clients.openWindow('/');
      })
    );
  } else if (event.action === 'delay') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          client.postMessage({ type: 'ALARM_ACTION', action: 'delay' });
          return client.focus();
        }
        return clients.openWindow('/');
      })
    );
  } else {
    // Default click
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});
