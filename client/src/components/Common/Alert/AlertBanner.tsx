import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Alert } from '@/types';


const AlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const socket = useSocket();

  useEffect(() => {
    socket?.on('alert', (alert: Alert) => {
      setAlerts(prev => [...prev, alert]);
    });

    return () => {
      socket?.off('alert');
    };
  }, [socket]);

  if (!alerts.length) return null;

  return (
    <div className="bg-red-500 text-white p-4 mb-4 rounded">
      {alerts.map(alert => (
        <div key={alert.id}>{alert.message}</div>
      ))}
    </div>
  );
};

export default AlertBanner;