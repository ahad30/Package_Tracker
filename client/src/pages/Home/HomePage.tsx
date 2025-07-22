import AlertTable from '@/components/Common/Alert/AlertTable';
import PackageDetail from '@/components/Common/Package/PackageDetail';
import PackageList from '@/components/Common/Package/PackageList';
import { Package } from '@/types';
import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Aamira Package Tracker</h1>
      <p className="mb-8 text-center">Track and manage your packages efficiently.</p>
      {selectedPackage ? (
        <PackageDetail packages={selectedPackage} onBack={() => setSelectedPackage(null)} />
      ) : (
        <PackageList onSelectPackage={setSelectedPackage} />
      )}
      <AlertTable />
    </div>
  );
};

export default HomePage;