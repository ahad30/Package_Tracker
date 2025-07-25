import AlertTable from '@/components/Common/Alert/AlertTable';
import PackageDetail from '@/components/Common/Package/PackageDetail';
import PackageList from '@/components/Common/Package/PackageList';
import { Package } from '@/types';
import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  return (
    <div className="container mx-auto p-4 space-y-5">
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