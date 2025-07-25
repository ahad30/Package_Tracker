import React, { useEffect, useState } from 'react';
import { Package } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { getDisplayStatus, getTimeDifferenceText, isPackageStuck } from '@/lib/utils';
import SkeletonTable from '../Skeleton/SkeletonTable';

interface PackageListProps {
  onSelectPackage: (pkg: Package) => void;
}

const PackageList: React.FC<PackageListProps> = ({ onSelectPackage }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Active');
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


  // search and filter
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.package_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'Active') {
      matchesFilter = !['DELIVERED', 'CANCELLED'].includes(pkg.current_status);
    } else if (filterStatus === 'Stuck') {
      matchesFilter = isPackageStuck(pkg.last_updated) && 
     !['DELIVERED', 'CANCELLED'].includes(pkg.current_status);
    }
    
    return matchesSearch && matchesFilter;
  });



  return (
  <div className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">

      <div className="bg-blue-600 text-white px-4 py-3 font-bold text-lg text-center">
        Aamira Package Tracker
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Package ID..."
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Active">Active</option>
            <option value="Stuck">Stuck</option>
          </select>
        </div>
      </div>

      {/* Package List Table */}

      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left font-medium text-gray-700">#</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Package ID</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Last Seen</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Location</th>
             
              </tr>
            </thead>
            <tbody>
              {filteredPackages?.length > 0 ? (
                filteredPackages.map((pkg, index) => {
                  const isStuck = isPackageStuck(pkg.last_updated) && 
                                !['DELIVERED', 'CANCELLED'].includes(pkg.current_status);
                  
                  return (
                    <tr
                      key={pkg.package_id}
                      className={`cursor-pointer hover:bg-gray-50 border-b ${
                        isStuck ? 'bg-red-500 text-white hover:bg-red-600' : ''
                      }`}
                      onClick={() => onSelectPackage(pkg)}
                    >
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{pkg.package_id}</td>
                      <td className="px-4 py-3 text-sm">
                        {getDisplayStatus(pkg)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getTimeDifferenceText(pkg.last_updated)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {pkg.lat && pkg.lon ? `${pkg.lat}, ${pkg.lon}` : '—'}
                      </td>
                    
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'Active' 
                      ? 'No packages match your criteria.' 
                      : 'No active packages found in the last 24 hours.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PackageList;