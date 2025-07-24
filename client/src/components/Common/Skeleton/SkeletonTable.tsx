import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 5,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="min-w-full bg-white border border-gray-500">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <th key={`header-${colIndex}`} className="px-4 py-5 animate-pulse border bg-gray-300">
              
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={`cell-${rowIndex}-${colIndex}`} className="px-4 py-2 border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;