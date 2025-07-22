import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Alert } from '@/types';

const AlertTable: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const socket = useSocket();

  useEffect(() => {
    socket?.on('alert', (alert: Alert) => {
      setAlerts(prev => {
        const existingAlertIndex = prev.findIndex(
          a => a.package_id === alert.package_id && !a.resolved
        );
        if (existingAlertIndex >= 0) {
          const updated = [...prev];
          updated[existingAlertIndex] = alert;
          return updated;
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
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Package ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {alerts.map(alert => (
            <tr key={alert.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {alert.package_id}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {alert.message}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(alert.created_at).toLocaleTimeString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-red-600 hover:text-red-800 font-bold"
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