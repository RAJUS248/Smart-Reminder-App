import { TimeReminder, WeatherReminder, LocationReminder, reminderStore } from './reminderStore';
import { notificationManager } from './notifications';

class NotificationScheduler {
  private timeoutIds: Map<string, NodeJS.Timeout> = new Map();
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.startScheduler();
  }

  startScheduler() {
    // Check for due reminders every minute
    const checkInterval = setInterval(() => {
      this.checkTimeReminders();
    }, 60000); // Check every minute

    // Store the interval ID for cleanup if needed
    this.intervalIds.set('main-scheduler', checkInterval);
  }

  scheduleTimeReminder(reminder: TimeReminder) {
    if (!reminder.isActive) return;

    const now = new Date();
    const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);

    if (reminderDateTime > now) {
      const timeUntilReminder = reminderDateTime.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        this.triggerNotification(reminder);
        
        // If it's recurring, schedule the next occurrence
        if (reminder.isRecurring && reminder.recurringDays) {
          this.scheduleRecurringReminder(reminder);
        }
      }, timeUntilReminder);

      this.timeoutIds.set(reminder.id, timeoutId);
    }
  }

  scheduleRecurringReminder(reminder: TimeReminder) {
    if (!reminder.recurringDays || reminder.recurringDays.length === 0) return;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find the next occurrence
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = daysOfWeek.indexOf(currentDay);
    
    let nextOccurrence: Date | null = null;
    
    for (let i = 1; i <= 7; i++) {
      const checkDayIndex = (currentDayIndex + i) % 7;
      const checkDay = daysOfWeek[checkDayIndex];
      
      if (reminder.recurringDays.includes(checkDay)) {
        nextOccurrence = new Date(now);
        nextOccurrence.setDate(now.getDate() + i);
        const [hours, minutes] = reminder.time.split(':');
        nextOccurrence.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        break;
      }
    }

    if (nextOccurrence) {
      const timeUntilNext = nextOccurrence.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        this.triggerNotification(reminder);
        this.scheduleRecurringReminder(reminder); // Schedule the next one
      }, timeUntilNext);

      this.timeoutIds.set(reminder.id, timeoutId);
    }
  }

  checkTimeReminders() {
    const reminders = reminderStore.getTimeReminders();
    const now = new Date();

    reminders.forEach(reminder => {
      if (!reminder.isActive) return;

      if (reminder.isRecurring && reminder.recurringDays) {
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        if (reminder.recurringDays.includes(currentDay) && reminder.time === currentTime) {
          this.triggerNotification(reminder);
        }
      } else {
        const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
        const timeDiff = Math.abs(reminderDateTime.getTime() - now.getTime());
        
        // Trigger if within 1 minute of the scheduled time
        if (timeDiff < 60000) {
          this.triggerNotification(reminder);
        }
      }
    });
  }

  triggerNotification(reminder: TimeReminder | WeatherReminder | LocationReminder) {
    if ('time' in reminder && 'date' in reminder) {
      // Time reminder
      const timeReminder = reminder as TimeReminder;
      notificationManager.showTimeReminder(timeReminder.title, timeReminder.time);
    } else if ('condition' in reminder) {
      // Weather reminder
      const weatherReminder = reminder as WeatherReminder;
      notificationManager.showWeatherReminder(
        weatherReminder.title, 
        weatherReminder.condition, 
        weatherReminder.location
      );
    } else if ('latitude' in reminder) {
      // Location reminder
      const locationReminder = reminder as LocationReminder;
      notificationManager.showLocationReminder(locationReminder.title, locationReminder.address);
    }
  }

  cancelReminder(reminderId: string) {
    const timeoutId = this.timeoutIds.get(reminderId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeoutIds.delete(reminderId);
    }
  }

  rescheduleAllReminders() {
    // Clear all existing timeouts
    this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
    this.timeoutIds.clear();

    // Reschedule all active time reminders
    const reminders = reminderStore.getTimeReminders();
    reminders.forEach(reminder => {
      if (reminder.isActive) {
        this.scheduleTimeReminder(reminder);
      }
    });
  }

  // Test notification function
  testNotification() {
    notificationManager.showNotification('Test Notification', {
      body: 'This is a test notification to check if notifications are working!',
      icon: '🔔'
    });
  }
}

export const notificationScheduler = new NotificationScheduler();