import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor() {}

  sendNotification(title: string, message: string): void {
    // Check if running in Electron environment
    if ((window as any).require) {
      // Electron-specific imports
      const notifier = (window as any).require('node-notifier');

      // Send notification using node-notifier
      notifier.notify({
        title: title,
        message: message
      });
    } else {
      // Handle browser-specific notification logic here
      console.warn('Notifications not supported in browser environment');
    }
  }
}
