import React from 'react';

const FilterPanel = ({ filters, onChange }) => {
  const handleSourceChange = (sourceVal) => {
    const newSource = filters.formSource === sourceVal ? '' : sourceVal;
    onChange({ ...filters, formSource: newSource });
  };

  return (
    <div className="bg-[#141517] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between select-none">
      <div className="flex items-center justify-between border-b border-[#222326] pb-1.5 mb-3">
        <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase text-left">
          Filtrar por Origem
        </h3>
        {filters.formSource && (
          <button
            onClick={() => onChange({ ...filters, formSource: '' })}
            className="text-[9px] font-black uppercase text-gold-primary hover:text-gold-hover transition-colors tracking-widest cursor-pointer border-none bg-transparent"
          >
            Limpar Filtro
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2.5 text-left">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['Formulário', 'MQL', 'Direct', 'Story Dr'].map(source => (
            <button
              key={source}
              onClick={() => handleSourceChange(source)}
              className={`flex items-center justify-center gap-2 px-2.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all duration-200 cursor-pointer ${
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
  );
};

export default FilterPanel;
