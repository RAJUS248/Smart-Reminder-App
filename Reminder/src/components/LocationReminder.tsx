import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MapPin, Navigation } from 'lucide-react';
import { LocationReminder, reminderStore } from '@/lib/reminderStore';
import { notificationManager } from '@/lib/notifications';
import ReminderCard from './ReminderCard';

export default function LocationReminderComponent() {
  const [reminders, setReminders] = useState<LocationReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: '100'
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    loadReminders();
    notificationManager.requestPermission();
  }, []);

  const loadReminders = () => {
    setReminders(reminderStore.getLocationReminders());
  };

  const resetForm = () => {
    setFormData({
      title: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: '100'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
        }));
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please enter coordinates manually.');
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminder: LocationReminder = {
      id: editingId || reminderStore.generateId(),
      title: formData.title,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      radius: Number(formData.radius),
      address: formData.address,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    reminderStore.saveLocationReminder(reminder);
    loadReminders();
    resetForm();
  };

  const handleEdit = (reminder: LocationReminder) => {
    setFormData({
      title: reminder.title,
      address: reminder.address,
      latitude: reminder.latitude.toString(),
      longitude: reminder.longitude.toString(),
      radius: reminder.radius.toString()
    });
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    reminderStore.deleteLocationReminder(id);
    loadReminders();
  };

  const handleToggle = (id: string, active: boolean) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      reminder.isActive = active;
      reminderStore.saveLocationReminder(reminder);
      loadReminders();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          <h2 className="text-2xl font-bold">Location Reminders</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Location Reminder
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit' : 'Add'} Location Reminder</CardTitle>
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
                <Label htmlFor="address">Address/Description</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address or location description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="37.7749"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-122.4194"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Button>
              </div>

              <div>
                <Label htmlFor="radius">Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                  placeholder="100"
                  min="10"
                  max="10000"
                  required
                />
              </div>

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
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No location reminders yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              type="location"
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