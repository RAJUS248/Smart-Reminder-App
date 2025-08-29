import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Clock, MapPin, Cloud } from 'lucide-react';
import { TimeReminder, WeatherReminder, LocationReminder } from '@/lib/reminderStore';

interface ReminderCardProps {
  reminder: TimeReminder | WeatherReminder | LocationReminder;
  type: 'time' | 'weather' | 'location';
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (active: boolean) => void;
}

export default function ReminderCard({ reminder, type, onEdit, onDelete, onToggle }: ReminderCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'weather':
        return <Cloud className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'time':
        return 'bg-blue-100 text-blue-800';
      case 'weather':
        return 'bg-green-100 text-green-800';
      case 'location':
        return 'bg-purple-100 text-purple-800';
    }
  };

  const renderDetails = () => {
    switch (type) {
      case 'time': {
        const timeReminder = reminder as TimeReminder;
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {timeReminder.date} at {timeReminder.time}
            </p>
            {timeReminder.isRecurring && (
              <Badge variant="outline" className="text-xs">
                Recurring: {timeReminder.recurringDays?.join(', ')}
              </Badge>
            )}
          </div>
        );
      }
      case 'weather': {
        const weatherReminder = reminder as WeatherReminder;
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Condition: {weatherReminder.condition}
              {weatherReminder.temperatureThreshold && (
                ` ${weatherReminder.temperatureOperator} ${weatherReminder.temperatureThreshold}°C`
              )}
            </p>
            <p className="text-sm text-gray-500">Location: {weatherReminder.location}</p>
          </div>
        );
      }
      case 'location': {
        const locationReminder = reminder as LocationReminder;
        return (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">{locationReminder.address}</p>
            <p className="text-sm text-gray-500">Radius: {locationReminder.radius}m</p>
          </div>
        );
      }
    }
  };

  return (
    <Card className={`transition-all duration-200 ${reminder.isActive ? 'border-l-4 border-l-blue-500' : 'opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg">{reminder.title}</CardTitle>
            <Badge className={getTypeColor()}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
          <Switch
            checked={reminder.isActive}
            onCheckedChange={onToggle}
          />
        </div>
      </CardHeader>
      <CardContent>
        {renderDetails()}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1"
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}