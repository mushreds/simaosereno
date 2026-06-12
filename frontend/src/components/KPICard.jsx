import React from 'react';

const KPICard = ({ title, value, formatType = 'number' }) => {
  const formatValue = (val) => {
    if (formatType === 'money') {
      if (val >= 1000000) {
        return `R$ ${(val / 1000000).toFixed(2).replace('.', ',')}M`;
      }
      // Formata como moeda cheia (sem centavos) para visual executivo e limpo
      return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
    }
    
    if (formatType === 'percent') {
      return `${val.toFixed(2).replace('.', ',')}%`;
    }
    
    return val.toLocaleString('pt-BR');
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#1C1712]/40 border border-[#2A2115] rounded-2xl p-4 w-full h-24 shadow-md hover:border-gold-primary transition-all duration-300 transform hover:-translate-y-0.5">
      <span className="text-base sm:text-lg md:text-xl font-extrabold text-white tracking-normal sm:tracking-wide mono-numbers whitespace-nowrap">
        {formatValue(value)}
      </span>
      <span className="text-[8px] sm:text-[9px] font-bold text-gold-primary tracking-widest uppercase mt-1.5 text-center">
        {title}
      </span>
    </div>
  );
};

export default KPICard;
