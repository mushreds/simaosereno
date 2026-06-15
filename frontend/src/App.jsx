import React, { useState } from 'react';
import OverviewSales from './pages/OverviewSales';
import LeadsReport from './pages/LeadsReport';
import SimaoReport from './pages/SimaoReport';
import MetaAdsReport from './pages/MetaAdsReport';

function App() {
  const [activePage, setActivePage] = useState('overview');

  return (
    <div className="flex-1 flex flex-col bg-[#0F1010] min-h-screen text-text-primary">
      {/* Barra de Navegação Superior Minimalista (Executiva) */}
      <div className="border-b border-[#24282F] px-4 py-3 md:px-6 md:py-4 flex items-center justify-between select-none">
        {/* Espaçador para manter abas centralizadas no desktop */}
        <div className="hidden md:block w-28" />

        {/* Abas de Navegação */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 bg-[#14171B] border border-[#24282F] p-1 rounded-xl shadow-inner max-w-full overflow-x-auto scrollbar-none self-center">
          <button 
            onClick={() => setActivePage('overview')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'overview' 
                ? 'bg-[#2A2115]/40 border border-[#817566] text-[#FFF3E3] shadow-lg' 
                : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
            }`}
          >
            <span className="hidden sm:inline">Visão </span>Geral
          </button>
          <button 
            onClick={() => setActivePage('leads')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'leads' 
                ? 'bg-[#2A2115]/40 border border-[#817566] text-[#FFF3E3] shadow-lg' 
                : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
            }`}
          >
            Leads
          </button>
          <button 
            onClick={() => setActivePage('simao')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'simao' 
                ? 'bg-[#2A2115]/40 border border-[#817566] text-[#FFF3E3] shadow-lg' 
                : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
            }`}
          >
            Diário
          </button>
          <button 
            onClick={() => setActivePage('meta')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activePage === 'meta' 
                ? 'bg-[#2A2115]/40 border border-[#817566] text-[#FFF3E3] shadow-lg' 
                : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
            }`}
          >
            Meta Ads
          </button>
        </div>

        {/* Versão / Status */}
        <div className="flex items-center gap-2 w-28 justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase">Kommo Sync</span>
        </div>
      </div>

      {/* Renderização Condicional da Página Ativa */}
      <div className="flex-1 flex flex-col">
        {activePage === 'overview' && <OverviewSales />}
        {activePage === 'leads' && <LeadsReport />}
        {activePage === 'simao' && <SimaoReport />}
        {activePage === 'meta' && <MetaAdsReport />}
      </div>
    </div>
  );
}

export default App;
