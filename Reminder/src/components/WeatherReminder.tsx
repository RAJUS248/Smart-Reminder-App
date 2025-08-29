import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Cloud } from 'lucide-react';
import { WeatherReminder, reminderStore } from '@/lib/reminderStore';
import { notificationManager } from '@/lib/notifications';
import ReminderCard from './ReminderCard';

type WeatherCondition = 'rain' | 'snow' | 'sunny' | 'cloudy' | 'temperature';
type TemperatureOperator = 'above' | 'below';

export default function WeatherReminderComponent() {
  const [reminders, setReminders] = useState<WeatherReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    condition: 'rain' as WeatherCondition,
    temperatureThreshold: '',
    temperatureOperator: 'above' as TemperatureOperator,
    location: ''
  });

  useEffect(() => {
    loadReminders();
    notificationManager.requestPermission();
  }, []);

  const loadReminders = () => {
    setReminders(reminderStore.getWeatherReminders());
  };

  const resetForm = () => {
    setFormData({
      title: '',
      condition: 'rain',
      temperatureThreshold: '',
      temperatureOperator: 'above',
      location: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminder: WeatherReminder = {
      id: editingId || reminderStore.generateId(),
      title: formData.title,
      condition: formData.condition,
      temperatureThreshold: formData.condition === 'temperature' ? Number(formData.temperatureThreshold) : undefined,
      temperatureOperator: formData.condition === 'temperature' ? formData.temperatureOperator : undefined,
      location: formData.location,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    reminderStore.saveWeatherReminder(reminder);
    loadReminders();
    resetForm();
  };

  const handleEdit = (reminder: WeatherReminder) => {
    setFormData({
      title: reminder.title,
      condition: reminder.condition,
      temperatureThreshold: reminder.temperatureThreshold?.toString() || '',
      temperatureOperator: reminder.temperatureOperator || 'above',
      location: reminder.location
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    reminderStore.deleteWeatherReminder(id);
    loadReminders();
  };

  const handleToggle = (id: string, active: boolean) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      reminder.isActive = active;
      reminderStore.saveWeatherReminder(reminder);
      loadReminders();
    }
  };

  const handleConditionChange = (value: string) => {
    setFormData(prev => ({ ...prev, condition: value as WeatherCondition }));
  };

  const handleTemperatureOperatorChange = (value: string) => {
    setFormData(prev => ({ ...prev, temperatureOperator: value as TemperatureOperator }));
  };

  const weatherConditions = [
    { value: 'rain', label: '🌧️ Rain' },
    { value: 'snow', label: '❄️ Snow' },
    { value: 'sunny', label: '☀️ Sunny' },
    { value: 'cloudy', label: '☁️ Cloudy' },
    { value: 'temperature', label: '🌡️ Temperature' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-green-600" />
          <h2 className="text-2xl font-bold">Weather Reminders</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Weather Reminder
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Weather Reminder</CardTitle>
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

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter city name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="condition">Weather Condition</Label>
                <Select value={formData.condition} onValueChange={handleConditionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {weatherConditions.map(condition => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.condition === 'temperature' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperatureOperator">Operator</Label>
                    <Select value={formData.temperatureOperator} onValueChange={handleTemperatureOperatorChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="temperatureThreshold">Temperature (°C)</Label>
                    <Input
                      id="temperatureThreshold"
                      type="number"
                      value={formData.temperatureThreshold}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperatureThreshold: e.target.value }))}
                      placeholder="25"
                      required
                    />
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
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No weather reminders yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              type="weather"
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