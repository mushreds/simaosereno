import React from 'react';

const FilterPanel = ({ filters, onChange }) => {
  const handleFunnelChange = (funnelId) => {
    // Se clicar no mesmo filtro, desmarca.
    const newFunnelId = filters.pipelineId === funnelId ? '' : funnelId;
    onChange({ ...filters, pipelineId: newFunnelId });
  };

  const handleTypeChange = (typeVal) => {
    const newType = filters.consultaType === typeVal ? '' : typeVal;
    onChange({ ...filters, consultaType: newType });
  };

  const handleSourceChange = (sourceVal) => {
    const newSource = filters.formSource === sourceVal ? '' : sourceVal;
    onChange({ ...filters, formSource: newSource });
  };

  return (
    <div className="bg-[#141517] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between h-full select-none">
      <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2">
        Filtros Avançados
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Filtro por Funil */}
        <div className="flex flex-col gap-2.5 text-left">
          <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase">
            Funil
          </span>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleFunnelChange('11626995')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all duration-200 cursor-pointer ${
                filters.pipelineId === '11626995'
                  ? 'bg-gold-primary border-gold-primary text-bg-primary font-bold shadow-md gold-glow'
                  : 'bg-bg-tertiary/40 border-border-card text-text-secondary hover:border-gold-border'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                filters.pipelineId === '11626995' ? 'border-bg-primary' : 'border-text-muted'
              }`}>
                {filters.pipelineId === '11626995' && <div className="w-1.5 h-1.5 rounded-full bg-bg-primary" />}
              </div>
              Comercial 01 (Consulta)
            </button>
            <button
              onClick={() => handleFunnelChange('11649015')}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all duration-200 cursor-pointer ${
                filters.pipelineId === '11649015'
                  ? 'bg-gold-primary border-gold-primary text-bg-primary font-bold shadow-md gold-glow'
                  : 'bg-bg-tertiary/40 border-border-card text-text-secondary hover:border-gold-border'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                filters.pipelineId === '11649015' ? 'border-bg-primary' : 'border-text-muted'
              }`}>
                {filters.pipelineId === '11649015' && <div className="w-1.5 h-1.5 rounded-full bg-bg-primary" />}
              </div>
              Comercial 02 (Cirurgia)
            </button>
          </div>
        </div>

        {/* Filtro por Canal / Formulário */}
        <div className="flex flex-col gap-2.5 text-left">
          <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase">
            Origem / Formulário
          </span>
          <div className="grid grid-cols-2 gap-2">
            {['Formulário', 'MQL', 'Direct', 'Story Dr'].map(source => (
              <button
                key={source}
                onClick={() => handleSourceChange(source)}
                className={`flex items-center gap-2 px-2.5 py-2.5 rounded-xl border text-[10px] font-bold text-left transition-all duration-200 cursor-pointer ${
                  filters.formSource === source
                    ? 'bg-gold-primary border-gold-primary text-bg-primary shadow-md gold-glow'
                    : 'bg-bg-tertiary/40 border-border-card text-text-secondary hover:border-gold-border'
                }`}
              >
                <div className={`w-3 h-3 rounded-md border flex items-center justify-center flex-shrink-0 ${
                  filters.formSource === source ? 'border-bg-primary bg-bg-primary' : 'border-text-muted'
                }`}>
                  {filters.formSource === source && <span className="text-white text-[8px] font-black">✓</span>}
                </div>
                {source}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
