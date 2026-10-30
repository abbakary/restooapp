import React from 'react';

/** Shown while a lazily-loaded module chunk downloads. */
export const ViewSkeleton: React.FC = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading module">
    <div className="skeleton h-24 w-full" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map(i => <div key={i} className="skeleton h-32" />)}
    </div>
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="skeleton h-80 lg:col-span-2" />
      <div className="skeleton h-80" />
    </div>
  </div>
);
