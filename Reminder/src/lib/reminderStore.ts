export interface TimeReminder {
  id: string;
  title: string;
  time: string;
  date: string;
  isActive: boolean;
  isRecurring: boolean;
  recurringDays?: string[];
  createdAt: string;
}

export interface WeatherReminder {
  id: string;
  title: string;
  condition: 'rain' | 'snow' | 'sunny' | 'cloudy' | 'temperature';
  temperatureThreshold?: number;
  temperatureOperator?: 'above' | 'below';
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface LocationReminder {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address: string;
  isActive: boolean;
  createdAt: string;
}

export type Reminder = TimeReminder | WeatherReminder | LocationReminder;

class ReminderStore {
  private readonly TIME_REMINDERS_KEY = 'timeReminders';
  private readonly WEATHER_REMINDERS_KEY = 'weatherReminders';
  private readonly LOCATION_REMINDERS_KEY = 'locationReminders';

  // Time Reminders
  getTimeReminders(): TimeReminder[] {
    const stored = localStorage.getItem(this.TIME_REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveTimeReminder(reminder: TimeReminder): void {
    const reminders = this.getTimeReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    localStorage.setItem(this.TIME_REMINDERS_KEY, JSON.stringify(reminders));
  }

  deleteTimeReminder(id: string): void {
    const reminders = this.getTimeReminders().filter(r => r.id !== id);
    localStorage.setItem(this.TIME_REMINDERS_KEY, JSON.stringify(reminders));
  }

  // Weather Reminders
  getWeatherReminders(): WeatherReminder[] {
    const stored = localStorage.getItem(this.WEATHER_REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveWeatherReminder(reminder: WeatherReminder): void {
    const reminders = this.getWeatherReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    localStorage.setItem(this.WEATHER_REMINDERS_KEY, JSON.stringify(reminders));
  }

  deleteWeatherReminder(id: string): void {
    const reminders = this.getWeatherReminders().filter(r => r.id !== id);
    localStorage.setItem(this.WEATHER_REMINDERS_KEY, JSON.stringify(reminders));
  }

  // Location Reminders
  getLocationReminders(): LocationReminder[] {
    const stored = localStorage.getItem(this.LOCATION_REMINDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  saveLocationReminder(reminder: LocationReminder): void {
    const reminders = this.getLocationReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
    }
    
    localStorage.setItem(this.LOCATION_REMINDERS_KEY, JSON.stringify(reminders));
  }

  deleteLocationReminder(id: string): void {
    const reminders = this.getLocationReminders().filter(r => r.id !== id);
    localStorage.setItem(this.LOCATION_REMINDERS_KEY, JSON.stringify(reminders));
  }

  // Utility methods
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAllReminders(): { time: TimeReminder[]; weather: WeatherReminder[]; location: LocationReminder[] } {
    return {
      time: this.getTimeReminders(),
      weather: this.getWeatherReminders(),
      location: this.getLocationReminders()
    };
  }
}

export const reminderStore = new ReminderStore();