import React from 'react';
import GaugeChart from './GaugeChart';
import { Calendar } from 'lucide-react';
import simaoLogo from '../assets/simao-logo.png';

const Header = ({ metrics, config, dateRange, onDateChange }) => {
  const { vgvTotal, vendasConsultaCount, vendasCirurgiaCount, roas } = metrics;
  const { metaVgv, metaConsulta, metaCirurgia } = config;

  return (
    <header className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6 border-b border-border-card mb-6">
      {/* Logo Dr. Simão Sereno (Apenas o Logotipo Oficial) */}
      <div className="flex items-center select-none self-start lg:self-center">
        <img 
          src={simaoLogo} 
          alt="Logo Simão Sereno" 
          className="h-16 w-auto object-contain" 
          style={{ mixBlendMode: 'screen' }} 
        />
      </div>

      {/* Gauges de Metas */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <GaugeChart
          label="Meta VGV"
          value={vgvTotal}
          max={metaVgv}
          prefix="R$ "
          formatType="money"
        />
        <GaugeChart
          label="Meta Consulta"
          value={vendasConsultaCount}
          max={metaConsulta}
          formatType="number"
        />
        <GaugeChart
          label="Meta Cirurgia"
          value={vendasCirurgiaCount}
          max={metaCirurgia}
          formatType="number"
        />
      </div>

      {/* DatePicker e ROAS Card */}
      <div className="flex flex-col items-end gap-2.5 self-end lg:self-center">
        {/* Atalhos de Tempo Rápidos */}
        <div className="flex items-center gap-1 bg-bg-secondary border border-border-card p-1 rounded-xl shadow-inner select-none">
          {[
            { label: 'Hoje', val: 0 },
            { label: '2D', val: 1 },
            { label: '7D', val: 7 },
            { label: '15D', val: 15 },
            { label: 'Mês', val: 30 },
            { label: '3M', val: 90 },
          ].map((item) => {
            const today = new Date('2026-06-12');
            let start = new Date('2026-06-12');
            if (item.val > 0) {
              start.setDate(today.getDate() - (item.val === 1 ? 1 : item.val - 1));
            }
            const startStr = start.toISOString().split('T')[0];
            const endStr = today.toISOString().split('T')[0];
            const isActive = dateRange.startDate === startStr && dateRange.endDate === endStr;

            const handleQuickFilter = () => {
              onDateChange({ startDate: startStr, endDate: endStr });
            };

            return (
              <button
                key={item.label}
                onClick={handleQuickFilter}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2A2115]/50 border border-gold-primary text-[#FFF3E3] shadow-md'
                    : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 bg-bg-secondary border border-border-card rounded-xl px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-md hover:border-gold-border transition-colors duration-200">
          <Calendar className="w-4 h-4 text-gold-primary" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateChange({ ...dateRange, startDate: e.target.value })}
            className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
          />
          <span className="text-text-muted">até</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateChange({ ...dateRange, endDate: e.target.value })}
            className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
          />
        </div>

        {/* ROAS Card */}
        <div className="flex items-center justify-between bg-bg-secondary border border-border-card rounded-xl px-4 py-2.5 w-48 shadow-lg relative overflow-hidden group hover:border-gold-border transition-colors duration-200">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase">ROAS Geral</span>
            <span className="text-xl font-bold text-gold-primary mt-0.5 group-hover:text-gold-hover transition-colors">
              {roas.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1 bg-gold-primary shadow-[0_0_10px_rgba(201,169,110,0.5)]" />
        </div>
      </div>
    </header>
  );
};

export default Header;
