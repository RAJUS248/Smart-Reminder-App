import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Cloud, MapPin, Settings, AlertCircle, Info } from 'lucide-react';
import { reminderStore } from '@/lib/reminderStore';
import { notificationManager } from '@/lib/notifications';
import TimeReminderComponent from '@/components/TimeReminder';
import WeatherReminderComponent from '@/components/WeatherReminder';
import LocationReminderComponent from '@/components/LocationReminder';

export default function Index() {
  const [stats, setStats] = useState({
    time: 0,
    weather: 0,
    location: 0,
    total: 0
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    updateStats();
    updatePermissionStatus();
    
    // Set up debug info
    const info = `Browser: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                           navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                           navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}
Protocol: ${location.protocol}
Host: ${location.hostname}`;
    setDebugInfo(info);
    
    // Check permission status periodically
    const checkPermission = setInterval(() => {
      updatePermissionStatus();
    }, 1000);

    return () => clearInterval(checkPermission);
  }, []);

  const updatePermissionStatus = () => {
    const currentPermission = notificationManager.getPermissionStatus();
    setNotificationPermission(currentPermission);
  };

  const updateStats = () => {
    const allReminders = reminderStore.getAllReminders();
    const activeTimeReminders = allReminders.time.filter(r => r.isActive).length;
    const activeWeatherReminders = allReminders.weather.filter(r => r.isActive).length;
    const activeLocationReminders = allReminders.location.filter(r => r.isActive).length;
    
    setStats({
      time: activeTimeReminders,
      weather: activeWeatherReminders,
      location: activeLocationReminders,
      total: activeTimeReminders + activeWeatherReminders + activeLocationReminders
    });
  };

  const requestNotificationPermission = async () => {
    console.log('Enable button clicked');
    setIsRequestingPermission(true);
    
    try {
      console.log('Calling notificationManager.requestPermission()');
      const granted = await notificationManager.requestPermission();
      console.log('Permission request result:', granted);
      
      // Force update the permission status
      setTimeout(() => {
        updatePermissionStatus();
      }, 500);
      
    } catch (error) {
      console.error('Error in requestNotificationPermission:', error);
      alert('Error requesting notifications: ' + error.message);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const testNotification = () => {
    console.log('Test button clicked');
    notificationManager.testNotification();
  };

  const showDebugInfo = () => {
    notificationManager.debugBrowserSupport();
    alert(`Debug Information:
${debugInfo}

Notification Permission: ${notificationPermission}
Notification Support: ${'Notification' in window ? 'Yes' : 'No'}

Check the browser console (F12) for more details.`);
  };

  const getNotificationStatusText = () => {
    switch (notificationPermission) {
      case 'granted':
        return { 
          text: 'Notifications are enabled and working! ✅', 
          color: 'text-green-700', 
          bgColor: 'bg-green-50', 
          borderColor: 'border-green-200' 
        };
      case 'denied':
        return { 
          text: 'Notifications are blocked. Click Help for instructions.', 
          color: 'text-red-700', 
          bgColor: 'bg-red-50', 
          borderColor: 'border-red-200' 
        };
      default:
        return { 
          text: 'Click Enable to allow notifications for reminders', 
          color: 'text-yellow-700', 
          bgColor: 'bg-yellow-50', 
          borderColor: 'border-yellow-200' 
        };
    }
  };

  const statusInfo = getNotificationStatusText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Smart Reminder App
          </h1>
          <p className="text-gray-600 text-lg">
            Never miss important moments with intelligent reminders
          </p>
        </div>

        {/* Notification Permission Alert */}
        <Card className={`mb-6 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {notificationPermission === 'granted' ? (
                <Bell className="h-5 w-5 text-green-600" />
              ) : notificationPermission === 'denied' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Bell className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className={`font-medium ${statusInfo.color}`}>
                  {notificationPermission === 'granted' ? 'Notifications Enabled' : 
                   notificationPermission === 'denied' ? 'Notifications Blocked' : 'Enable Notifications'}
                </p>
                <p className={`text-sm ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={showDebugInfo}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Info className="h-4 w-4" />
              </Button>
              {notificationPermission === 'granted' && (
                <Button 
                  onClick={testNotification}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Test
                </Button>
              )}
              <Button 
                onClick={requestNotificationPermission}
                disabled={isRequestingPermission}
                variant="outline"
                className={notificationPermission === 'denied' ? 
                  "border-red-300 text-red-700 hover:bg-red-100" : 
                  notificationPermission === 'granted' ?
                  "border-green-300 text-green-700 hover:bg-green-100" :
                  "border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                }
              >
                {isRequestingPermission ? 'Requesting...' : 
                 notificationPermission === 'denied' ? 'Help' : 
                 notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Active</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.time}</div>
              <p className="text-sm text-gray-600">Time</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <Cloud className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.weather}</div>
              <p className="text-sm text-gray-600">Weather</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.location}</div>
              <p className="text-sm text-gray-600">Location</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="time" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Reminders
              {stats.time > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.time}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Weather Reminders
              {stats.weather > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.weather}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Reminders
              {stats.location > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {stats.location}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="time">
            <TimeReminderComponent />
          </TabsContent>

          <TabsContent value="weather">
            <WeatherReminderComponent />
          </TabsContent>

          <TabsContent value="location">
            <LocationReminderComponent />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            Smart Reminder App - Stay organized and never miss what matters
          </p>
        </div>
      </div>
    </div>
  );
}