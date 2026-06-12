import React, { useState, useEffect } from 'react';
import { getSimaoReport } from '../services/api';
import { Calendar, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

const SimaoReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showIndicator = false) => {
    if (showIndicator) setRefreshing(true);
    try {
      const reportData = await getSimaoReport();
      setData(reportData);
    } catch (err) {
      console.error('Error loading Simão report page:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="w-full min-h-screen bg-[#0B0B0C] p-6 animate-pulse flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-80">
          <div className="bg-bg-secondary rounded-2xl" />
          <div className="bg-bg-secondary rounded-2xl" />
          <div className="bg-bg-secondary rounded-2xl" />
        </div>
        <div className="h-44 bg-bg-secondary rounded-2xl" />
      </div>
    );
  }

  // 1. Encontrar o valor máximo mensal para escala do gráfico de barras
  const maxMonthlyLeads = Math.max(
    ...data.monthlyComparison.map(m => Math.max(m.esteAno, m.anoPassado)),
    100
  );

  // 2. Encontrar o valor máximo semanal para o gráfico de linhas
  const maxWeeklyLeads = Math.max(...data.monthWeeks.map(w => w.count), 20);

  // 3. Montar coordenadas de pontos do gráfico de linha para 4 semanas (S1, S2, S3, S4)
  // Largura do gráfico = 300, Altura = 120, Margem = 20
  // Pontos de X divididos igualmente: S1 = 40, S2 = 120, S3 = 200, S4 = 280
  const linePoints = data.monthWeeks.map((week, idx) => {
    const x = 40 + idx * 80;
    const y = 110 - (week.count / maxWeeklyLeads) * 90; // Escala vertical
    return { x, y, label: week.label, count: week.count };
  });

  // Criar string de path para a linha (Célula cúbica de suavização)
  const linePathD = linePoints.reduce((path, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    // Ponto anterior
    const prev = linePoints[idx - 1];
    // Curva suave usando pontos de controle intermediários
    const cp1x = prev.x + 40;
    const cp1y = prev.y;
    const cp2x = p.x - 40;
    const cp2y = p.y;
    return `${path} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="w-full flex flex-col gap-6 select-none p-6 bg-[#0B0B0C] min-h-screen text-text-primary">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-card">
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-bold tracking-widest text-text-secondary uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-primary" />
            Simão Sereno System
          </h2>
          <span className="text-[10px] text-text-muted font-medium tracking-wider mt-0.5">
            Monitor diário de entrada de leads e acompanhamento de coortes de tráfego
          </span>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="p-2 bg-bg-secondary border border-border-card text-gold-primary hover:text-white rounded-full shadow hover:border-gold-primary transition-all duration-300 disabled:opacity-50 cursor-pointer group hover:-rotate-180"
          title="Recarregar dados"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid Superior (Três Blocos do Quadro) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Bloco 1: Comparativo Mensal (Ano Passado vs Este Ano) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[300px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase">
              Mês (Comparativo Ano Passado)
            </span>
            <div className="flex items-center gap-2 text-[8px] font-bold tracking-wider">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-gold-primary" /> 2026</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-border-card" /> 2025</span>
            </div>
          </div>

          {/* Gráfico de Barras SVG */}
          <div className="flex-1 flex items-end justify-between gap-2 h-36 px-2">
            {data.monthlyComparison.map((m) => {
              const hEsteAno = (m.esteAno / maxMonthlyLeads) * 100;
              const hAnoPassado = (m.anoPassado / maxMonthlyLeads) * 100;

              return (
                <div key={m.month} className="flex flex-col items-center flex-1 gap-2">
                  {/* Dupla de Barras */}
                  <div className="w-full flex items-end justify-center gap-1 h-32 relative">
                    {/* Barra Ano Passado 2025 (Cinza) */}
                    <div
                      style={{ height: `${hAnoPassado}%` }}
                      className="w-3.5 bg-bg-tertiary border border-border-card rounded-t-sm transition-all duration-500 relative group"
                      title={`2025: ${m.anoPassado} leads`}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#0F1010] text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-border-card mono-numbers">
                        {m.anoPassado}
                      </div>
                    </div>
                    {/* Barra Este Ano 2026 (Dourado/Bege) */}
                    <div
                      style={{ height: `${hEsteAno}%` }}
                      className="w-3.5 bg-gold-primary border border-gold-dark rounded-t-sm hover:bg-gold-hover transition-all duration-500 relative group shadow-[0_0_10px_rgba(129,117,102,0.15)]"
                      title={`2026: ${m.esteAno} leads`}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gold-primary text-bg-primary text-[8px] font-black px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 mono-numbers">
                        {m.esteAno}
                      </div>
                    </div>
                  </div>
                  {/* Label do mês */}
                  <span className="text-[9px] font-black text-text-muted tracking-wider">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloco 2: Hoje Chegaram (Diário Leads) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center h-[300px]">
          <span className="text-[10px] font-black text-text-muted tracking-widest uppercase mb-4">
            Hoje Chegaram:
          </span>

          {/* Círculo luminoso com contorno e efeito neon */}
          <div className="relative w-44 h-44 rounded-full border-4 border-gold-primary/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(129,117,102,0.1)] group hover:border-gold-primary/70 transition-all duration-500 bg-[#0F1010]">
            <div className="absolute inset-2 rounded-full border border-dashed border-gold-primary/20" />
            <span className="text-[10px] font-black tracking-[0.2em] text-gold-primary uppercase">
              Diário
            </span>
            <span className="text-5xl font-black text-white my-1 mono-numbers select-none text-gold-gradient filter drop-shadow-[0_2px_10px_rgba(255,243,227,0.2)]">
              {data.leadsHoje}
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] text-text-secondary uppercase mt-1">
              Leads
            </span>
          </div>
        </div>

        {/* Bloco 3: Semana (Gráfico de Linhas das Semanas do Mês) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between h-[300px]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black text-text-secondary tracking-widest uppercase">
              Leads por Semana
            </span>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">
              mês corrente (Junho)
            </span>
          </div>

          {/* Gráfico de Linhas SVG */}
          <div className="flex-1 w-full relative flex items-center justify-center">
            <svg className="w-full h-36" viewBox="0 0 320 130" xmlns="http://www.w3.org/2000/svg">
              {/* Grid Lines Horizontais */}
              {[0, 1, 2].map((i) => {
                const y = 20 + i * 45;
                return (
                  <line
                    key={i}
                    x1="20"
                    y1={y}
                    x2="300"
                    y2={y}
                    stroke="#1C1D21"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Path de linha curva suave */}
              {linePathD && (
                <path
                  d={linePathD}
                  fill="none"
                  stroke="#817566"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              )}

              {/* Pontos nos vértices (Semana 1 a 4) */}
              {linePoints.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  {/* Círculo de efeito glow no hover */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    className="fill-gold-primary opacity-0 group-hover:opacity-25 transition-opacity"
                  />
                  {/* Ponto principal */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    className="fill-white stroke-gold-primary stroke-[2.5]"
                  />
                  {/* Valor absoluto do ponto */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fill="#FFF3E3"
                    className="text-[9px] font-black mono-numbers opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    {p.count}
                  </text>
                  {/* Eixo X Label */}
                  <text
                    x={p.x}
                    y="125"
                    textAnchor="middle"
                    fill="#686868"
                    className="text-[9px] font-black tracking-widest"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

      </div>

      {/* Bloco Inferior: Distribuição Diária da Semana Corrente (Segunda a Domingo) */}
      <div className="bg-[#14171B] border border-border-card rounded-2xl p-6 shadow-lg flex flex-col gap-6">
        <div className="flex flex-col text-left border-b border-[#222326] pb-2">
          <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase">
            Desempenho Diário da Semana Corrente
          </h3>
          <span className="text-[8px] text-text-muted font-bold tracking-wider mt-0.5 lowercase">
            leads recebidos de segunda-feira a domingo da semana atual (referência: hoje 12/06)
          </span>
        </div>

        {/* Fila Horizontal de Dias da Semana (Layout do Quadro) - Responsivo com scroll no mobile */}
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-7 gap-3 sm:gap-4 w-full pb-2 sm:pb-0 scrollbar-none">
          {data.weekLeads.map((day, idx) => {
            // Sexta-feira é o dia de hoje (índice 4 correspondente a sexta-feira na semana começando na segunda)
            const isToday = idx === 4;
            const isFuture = idx > 4;

            return (
              <div
                key={idx}
                className={`flex-shrink-0 w-24 sm:w-auto flex flex-col items-center justify-between rounded-xl p-4 h-28 border transition-all duration-300 relative ${
                  isToday
                    ? 'bg-[#1C1712]/30 border-gold-primary shadow-[0_0_15px_rgba(129,117,102,0.2)] scale-102 z-10'
                    : isFuture
                    ? 'bg-bg-primary/20 border-[#222326] opacity-40'
                    : 'bg-bg-primary/50 border-[#222326] hover:border-gold-border'
                }`}
              >
                {/* Inicial do Dia da Semana */}
                <span className={`text-sm font-black tracking-widest ${
                  isToday ? 'text-gold-primary' : 'text-text-secondary'
                }`}>
                  {day.label}
                </span>

                {/* Quantidade de Leads */}
                <div className="flex flex-col items-center">
                  <span className={`text-2xl font-black mono-numbers leading-none ${
                    isToday ? 'text-white' : isFuture ? 'text-text-muted' : 'text-white'
                  }`}>
                    {day.count}
                  </span>
                  <span className="text-[7px] text-text-muted font-bold tracking-widest uppercase mt-1 leading-none">
                    Leads
                  </span>
                </div>

                {/* Tag de Identificação */}
                <span className="text-[7px] font-bold text-text-muted tracking-widest uppercase select-none leading-none">
                  {idx === 0 ? 'Seg' : idx === 1 ? 'Ter' : idx === 2 ? 'Qua' : idx === 3 ? 'Qui' : idx === 4 ? 'Hoje' : idx === 5 ? 'Sáb' : 'Dom'}
                </span>
                
                {/* Indicador de Destaque para Hoje */}
                {isToday && (
                  <div className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-gold-primary animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SimaoReport;
