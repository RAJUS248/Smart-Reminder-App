class NotificationManager {
  private permission: NotificationPermission = 'default';

  constructor() {
    this.permission = this.getPermissionStatus();
    console.log('NotificationManager initialized, permission:', this.permission);
  }

  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }
    console.log('Current notification permission:', Notification.permission);
    return Notification.permission;
  }

  async requestPermission(): Promise<boolean> {
    console.log('Requesting notification permission...');
    
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      alert('Your browser does not support notifications. Please try using Chrome, Firefox, or Safari.');
      return false;
    }

    // Check current permission
    const currentPermission = Notification.permission;
    console.log('Current permission before request:', currentPermission);

    if (currentPermission === 'granted') {
      console.log('Permission already granted');
      this.permission = 'granted';
      return true;
    }

    if (currentPermission === 'denied') {
      console.log('Permission was previously denied');
      // Show manual instructions
      const message = `Notifications are currently blocked. To enable them:

🖥️ Desktop:
1. Look for a 🔔 or 🚫 icon in your browser's address bar
2. Click it and select "Allow notifications"
3. Refresh this page

📱 Mobile:
1. Tap the menu (⋮) in your browser
2. Go to "Site settings" or "Permissions"
3. Find "Notifications" and enable it
4. Refresh this page

Alternative: Clear this site's data in browser settings and try again.`;
      
      alert(message);
      return false;
    }

    try {
      console.log('Requesting permission from browser...');
      
      // Use the modern promise-based API if available
      let permission: NotificationPermission;
      
      if (typeof Notification.requestPermission === 'function') {
        // Modern browsers
        permission = await Notification.requestPermission();
      } else {
        // Fallback for older browsers
        permission = await new Promise((resolve) => {
          Notification.requestPermission(resolve);
        });
      }
      
      console.log('Permission result:', permission);
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('Permission granted! Showing welcome notification...');
        // Show a welcome notification
        setTimeout(() => {
          this.showNotification('Notifications Enabled! 🎉', {
            body: 'You will now receive reminder notifications.',
            icon: '🔔',
            tag: 'welcome'
          });
        }, 500);
        return true;
      } else {
        console.warn('Permission denied by user');
        alert('Notifications were not enabled. You can enable them later by clicking the notification icon in your browser\'s address bar.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      alert('There was an error requesting notification permission. Please try refreshing the page or check your browser settings.');
      return false;
    }
  }

  showNotification(title: string, options: NotificationOptions = {}) {
    console.log('Attempting to show notification:', title);
    
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    const currentPermission = Notification.permission;
    console.log('Current permission for showing notification:', currentPermission);

    if (currentPermission !== 'granted') {
      console.warn('Notification permission not granted, current status:', currentPermission);
      return;
    }

    try {
      console.log('Creating notification with options:', options);
      const notification = new Notification(title, {
        icon: options.icon || '🔔',
        badge: '🔔',
        requireInteraction: false,
        ...options
      });

      console.log('Notification created successfully');

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Add event listeners for debugging
      notification.onshow = () => console.log('Notification shown');
      notification.onclick = () => console.log('Notification clicked');
      notification.onclose = () => console.log('Notification closed');
      notification.onerror = (error) => console.error('Notification error:', error);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      alert('Error showing notification: ' + error.message);
    }
  }

  showTimeReminder(title: string, time: string) {
    this.showNotification(`⏰ ${title}`, {
      body: `Scheduled for ${time}`,
      icon: '⏰',
      tag: 'time-reminder'
    });
  }

  showWeatherReminder(title: string, condition: string, location: string) {
    this.showNotification(`🌤️ ${title}`, {
      body: `Weather condition: ${condition} in ${location}`,
      icon: '🌤️',
      tag: 'weather-reminder'
    });
  }

  showLocationReminder(title: string, address: string) {
    this.showNotification(`📍 ${title}`, {
      body: `Location: ${address}`,
      icon: '📍',
      tag: 'location-reminder'
    });
  }

  // Test notification with better error handling
  testNotification() {
    console.log('Testing notification...');
    const currentPermission = this.getPermissionStatus();
    console.log('Permission status for test:', currentPermission);
    
    if (currentPermission === 'granted') {
      this.showNotification('Test Notification 🧪', {
        body: 'Great! Notifications are working perfectly.',
        icon: '✅',
        tag: 'test'
      });
    } else {
      console.warn('Cannot show test notification: permission not granted');
      alert(`Cannot show test notification. Current permission: ${currentPermission}\n\nPlease enable notifications first by clicking the "Enable" button above.`);
    }
  }

  // Debug method to check browser capabilities
  debugBrowserSupport() {
    console.log('=== Notification Debug Info ===');
    console.log('Notification support:', 'Notification' in window);
    console.log('Current permission:', Notification.permission);
    console.log('User agent:', navigator.userAgent);
    console.log('Is HTTPS:', location.protocol === 'https:');
    console.log('Is localhost:', location.hostname === 'localhost');
    console.log('================================');
  }
}

export const notificationManager = new NotificationManager();

// Debug on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    notificationManager.debugBrowserSupport();
  });
}