import React from 'react';

const LoadingState = () => {
  return (
    <div className="w-full min-h-screen bg-[#0B0B0C] p-6 animate-pulse flex flex-col gap-6">
      {/* Header Loading */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-[#222326]">
        {/* Logo & Title */}
        <div className="flex items-center gap-4 self-start lg:self-center">
          <div className="w-24 h-10 bg-[#141517] rounded-xl" />
          <div className="h-6 w-px bg-[#222326]" />
          <div className="flex flex-col gap-2">
            <div className="w-32 h-5 bg-[#141517] rounded" />
            <div className="w-44 h-3 bg-[#141517] rounded" />
          </div>
        </div>
        
        {/* Gauges */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-48 h-32 bg-[#141517] rounded-2xl" />
          <div className="w-48 h-32 bg-[#141517] rounded-2xl" />
          <div className="w-48 h-32 bg-[#141517] rounded-2xl" />
        </div>

        {/* Datepicker & ROAS */}
        <div className="flex flex-col items-end gap-3 self-end lg:self-center">
          <div className="w-64 h-10 bg-[#141517] rounded-xl" />
          <div className="w-48 h-10 bg-[#141517] rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-[#141517] rounded-2xl" />
        ))}
      </div>

      {/* Main Grid: Funnels + Ranking & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Left Column: Funnels */}
        <div className="flex flex-col gap-6">
          <div className="h-[280px] bg-[#141517] rounded-2xl" />
          <div className="h-[220px] bg-[#141517] rounded-2xl" />
        </div>

        {/* Right Column: Ranking & Filters */}
        <div className="flex flex-col gap-6">
          <div className="h-[260px] bg-[#141517] rounded-2xl" />
          <div className="h-[240px] bg-[#141517] rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
