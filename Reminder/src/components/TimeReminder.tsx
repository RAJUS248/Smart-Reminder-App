import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, Bell } from 'lucide-react';
import { TimeReminder, reminderStore } from '@/lib/reminderStore';
import { notificationManager } from '@/lib/notifications';
import { notificationScheduler } from '@/lib/notificationScheduler';
import ReminderCard from './ReminderCard';

export default function TimeReminderComponent() {
  const [reminders, setReminders] = useState<TimeReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    date: '',
    isRecurring: false,
    recurringDays: [] as string[]
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadReminders();
    // Request notification permission on component mount
    notificationManager.requestPermission();
  }, []);

  const loadReminders = () => {
    setReminders(reminderStore.getTimeReminders());
  };

  const resetForm = () => {
    setFormData({
      title: '',
      time: '',
      date: '',
      isRecurring: false,
      recurringDays: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminder: TimeReminder = {
      id: editingId || reminderStore.generateId(),
      title: formData.title,
      time: formData.time,
      date: formData.date,
      isActive: true,
      isRecurring: formData.isRecurring,
      recurringDays: formData.isRecurring ? formData.recurringDays : undefined,
      createdAt: new Date().toISOString()
    };

    reminderStore.saveTimeReminder(reminder);
    
    // Schedule the notification
    if (reminder.isActive) {
      notificationScheduler.scheduleTimeReminder(reminder);
    }
    
    loadReminders();
    resetForm();
  };

  const handleEdit = (reminder: TimeReminder) => {
    setFormData({
      title: reminder.title,
      time: reminder.time,
      date: reminder.date,
      isRecurring: reminder.isRecurring,
      recurringDays: reminder.recurringDays || []
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    notificationScheduler.cancelReminder(id);
    reminderStore.deleteTimeReminder(id);
    loadReminders();
  };

  const handleToggle = (id: string, active: boolean) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      reminder.isActive = active;
      reminderStore.saveTimeReminder(reminder);
      
      if (active) {
        notificationScheduler.scheduleTimeReminder(reminder);
      } else {
        notificationScheduler.cancelReminder(id);
      }
      
      loadReminders();
    }
  };

  const handleRecurringDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        recurringDays: [...prev.recurringDays, day]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recurringDays: prev.recurringDays.filter(d => d !== day)
      }));
    }
  };

  const testNotification = () => {
    notificationScheduler.testNotification();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold">Time Reminders</h2>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testNotification} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Test Notification
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Time Reminder
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Time Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter reminder title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required={!formData.isRecurring}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                />
                <Label htmlFor="recurring">Recurring reminder</Label>
              </div>

              {formData.isRecurring && (
                <div>
                  <Label>Repeat on days:</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {weekDays.map(day => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.recurringDays.includes(day)}
                          onCheckedChange={(checked) => handleRecurringDayChange(day, checked as boolean)}
                        />
                        <Label htmlFor={day} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update' : 'Add'} Reminder
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No time reminders yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              type="time"
              onEdit={() => handleEdit(reminder)}
              onDelete={() => handleDelete(reminder.id)}
              onToggle={(active) => handleToggle(reminder.id, active)}
            />
          ))
        )}
      </div>
    </div>
  );
}