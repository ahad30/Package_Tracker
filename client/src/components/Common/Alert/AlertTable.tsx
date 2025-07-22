import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Alert } from '@/types';

const AlertTable: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const socket = useSocket();

useEffect(() => {
    socket?.on('alert', (alert: Alert) => {
      setAlerts(prev => {
        // If alert for this package_id already exists, update message instead of adding
        const exists = prev.find(a => a.package_id === alert.package_id && !a.resolved);
        if (exists) {
          return prev.map(a => a.package_id === alert.package_id ? alert : a);
        }
        return [...prev, alert];
      });
    });

    return () => {
      socket?.off('alert');
    };
  }, [socket]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  if (!alerts.length) return null;

  return (
    <div className="bg-white border border-red-300 rounded-lg shadow-md overflow-hidden mb-6">
      <div className="bg-red-500 text-white px-4 py-2 font-semibold">
        Active Alerts
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2  text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Package ID
            </th>
            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Message
            </th>
            <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Action/Dismiss
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map(alert => (
            <tr key={alert.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                {alert.package_id}
              </td>
              <td className="px-4 py-3  text-center text-sm text-gray-500">
                {alert.message}
              </td>
              <td className="px-4 py-3 text-center text-sm text-gray-500">
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-red-600 hover:text-red-800 font-bold text-2xl"
                  title="Dismiss alert"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AlertTable;