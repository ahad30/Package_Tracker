import React, { useEffect, useState } from 'react';
import { Package } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import moment from 'moment';
import { getTimeDifferenceText } from '@/lib/utils';
import SkeletonTable from '../Skeleton/SkeletonTable';

interface PackageListProps {
  onSelectPackage: (pkg: Package) => void;
}

const PackageList: React.FC<PackageListProps> = ({ onSelectPackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_BACKEND_URL}/packages`, {
      method: 'GET',
      headers: { Authorization: 'Bearer aamira-secret-token' },
    })
      .then(res => res.json())
      .then(data => {
        setPackages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socket?.on('packageUpdate', (updatedPackage: Package) => {
      setPackages(prev => {
        const index = prev.findIndex(p => p.package_id === updatedPackage.package_id);
        if (index >= 0) {
          return [...prev.slice(0, index), updatedPackage, ...prev.slice(index + 1)];
        }
        return [...prev, updatedPackage];
      });
    });

    return () => {
      socket?.off('packageUpdate');
    };
  }, [socket]);

  return (
    <>
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-500">
            <thead>
              <tr>
                <th className="px-4 py-2 border bg-blue-500 text-white">Package ID</th>
                <th className="px-4 py-2 border bg-blue-500 text-white">Status</th>
                <th className="px-4 py-2 border bg-blue-500 text-white">Last Updated</th>
                <th className="px-4 py-2 border bg-blue-500 text-white">Location</th>
                <th className="px-4 py-2 border bg-blue-500 text-white">ETA</th>
              </tr>
            </thead>
            <tbody>
              {packages?.length > 0 ? (
                packages.map(pkg => (
                  <tr
                    key={pkg.package_id}
                    className={`cursor-pointer ${
                      new Date().getTime() - new Date(pkg.last_updated).getTime() > 30 * 60 * 1000
                        ? 'bg-red-400 text-white'
                        : ''
                    }`}
                    onClick={() => onSelectPackage(pkg)}
                  >
                    <td className="px-4 py-2 text-center border border-black">{pkg.package_id}</td>
                    <td className="px-4 py-2 border border-black text-center">{pkg.current_status}</td>
                    <td className="px-4 py-2 border border-black text-center">
                      {getTimeDifferenceText(pkg.last_updated)}
                    </td>
                    <td className="px-4 py-2 border border-black text-center">
                      {pkg.lat && pkg.lon ? `${pkg.lat}, ${pkg.lon}` : '—'}
                    </td>
                    <td className="px-4 py-2 border border-black text-center">
                      {pkg.eta ? moment.utc(pkg.eta).local().format('MMMM Do YYYY, h:mm:ss a') : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center border font-bold border-black text-red-500">
                    No active packages found in the last 24 hours.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default PackageList;