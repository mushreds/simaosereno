import React from 'react';

const FunnelChart = ({ title, stages, conversionRate, totalLeads }) => {
  // Encontra o valor máximo para dimensionar as barras horizontalmente
  const maxCount = stages && stages.length > 0 ? Math.max(...stages.map(s => s.count)) : 1;

  return (
    <div className="flex bg-[#141517] border border-border-card rounded-2xl p-4 md:p-5 shadow-lg relative h-full flex-col md:flex-row gap-4">
      {/* Cabeçalho para Mobile (Substitui indicador vertical em telas pequenas) */}
      <div className="flex md:hidden items-center justify-between border-b border-[#222326] pb-2.5 mb-1 select-none">
        <span className="text-xs font-black tracking-widest text-white uppercase">{title}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-extrabold text-gold-primary leading-none mono-numbers">
            {totalLeads || 0}
          </span>
          <span className="text-[8px] text-text-muted font-bold tracking-widest uppercase leading-none">
            Leads
          </span>
        </div>
      </div>

      {/* Indicador Vertical da Esquerda (Apenas Desktop/Tablet) */}
      <div className="hidden md:flex flex-col items-center justify-between border-r border-[#222326] pr-4 w-12 select-none">
        <span className="text-xs font-black tracking-[0.3em] text-white uppercase transform -rotate-90 origin-center my-auto whitespace-nowrap">
          {title}
        </span>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-[9px] font-bold text-gold-primary tracking-wider leading-none mono-numbers">
            {totalLeads || 0}
          </span>
          <span className="text-[7px] text-text-muted font-bold tracking-widest uppercase leading-none">
            Leads
          </span>
        </div>
      </div>

      {/* Conteúdo do Funil */}
      <div className="flex-1 flex flex-col justify-between gap-3">
        {/* Cabeçalho da Tabela do Funil */}
        <div className="flex justify-between items-center text-[8px] font-bold text-text-muted tracking-widest uppercase px-1 md:px-2">
          <span className="w-16 sm:w-24 text-left">Etapas</span>
          <span className="flex-1 text-center pr-4 sm:pr-16">Leads</span>
          <span className="w-16 sm:w-20 text-right">% Leads</span>
          <span className="w-16 sm:w-20 text-right">% Conversão</span>
        </div>

        {/* Linhas das Etapas */}
        <div className="flex flex-col justify-between gap-2.5 flex-1">
          {stages && stages.map((stage, idx) => {
            // Calcula a largura proporcional da barra (mínimo de 30% para legibilidade)
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 70 + 30 : 30;

            // Calcula o percentual de conversão em relação à etapa anterior
            let relativeConvRate = 100;
            if (idx > 0 && stages[idx - 1].count > 0) {
              relativeConvRate = (stage.count / stages[idx - 1].count) * 100;
            } else if (idx > 0) {
              relativeConvRate = 0;
            }
            const convRateStr = `${relativeConvRate.toFixed(1).replace('.', ',')}%`;

            return (
              <div key={stage.name} className="flex justify-between items-center text-xs h-8 group gap-1">
                {/* Nome da etapa */}
                <span className="w-16 sm:w-24 text-[8px] sm:text-[9px] font-bold text-text-secondary text-left uppercase leading-tight select-none truncate" title={stage.name}>
                  {stage.name}
                </span>

                {/* Barra do Funil */}
                <div className="flex-1 flex justify-start items-center px-1 sm:px-4 relative">
                  <div
                    style={{ width: `${widthPercent}%` }}
                    className="h-6 sm:h-7 bg-[#2A2115]/20 border border-[#2A2115] hover:border-gold-primary transition-all duration-500 ease-out rounded-lg flex items-center justify-end px-2 sm:px-3 shadow-inner relative group-hover:gold-glow"
                  >
                    {/* Linha de progresso com gradiente */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2A2115] to-[#817566] rounded-l-lg opacity-25"
                      style={{ width: '30%' }}
                    />
                    {/* Quantidade de leads */}
                    <span className="text-[9px] sm:text-[10px] font-extrabold text-white z-10 mono-numbers">
                      {stage.count}
                    </span>
                  </div>
                </div>

                {/* Taxa de Conversão */}
                <span className="w-16 sm:w-20 text-right text-[8px] sm:text-[10px] font-semibold text-text-secondary select-none mono-numbers">
                  {stage.txConversao.toFixed(1).replace('.', ',')}%
                </span>

                {/* Custo por Lead da Etapa */}
                <span className="w-16 sm:w-20 text-right text-[8px] sm:text-[10px] font-bold text-gold-primary select-none mono-numbers">
                  {convRateStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FunnelChart;
