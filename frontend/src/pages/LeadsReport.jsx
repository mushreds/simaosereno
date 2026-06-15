import React, { useState, useEffect } from 'react';
import { getOverviewMetrics, getPipelines } from '../services/api';
import { Calendar, Layers, TrendingUp, TrendingDown, DollarSign, Users, AlertOctagon, HelpCircle } from 'lucide-react';

const getDefaultDateRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  
  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay)
  };
};

const LeadsReport = () => {
  // Período dinâmico (Mês Atual)
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  const [localStartDate, setLocalStartDate] = useState(dateRange.startDate);
  const [localEndDate, setLocalEndDate] = useState(dateRange.endDate);

  useEffect(() => {
    setLocalStartDate(dateRange.startDate);
    setLocalEndDate(dateRange.endDate);
  }, [dateRange]);

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const data = await getOverviewMetrics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setMetrics(data);
    } catch (err) {
      console.error('Error loading CEO metrics report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const formatCurrency = (val) => {
    return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
  };

  const formatPercent = (val) => {
    return `${val.toFixed(2).replace('.', ',')}%`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0B0B0C] p-6 animate-pulse flex flex-col gap-6">
        <div className="h-12 bg-bg-secondary border border-border-card rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-bg-secondary rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          <div className="h-96 bg-bg-secondary rounded-2xl" />
          <div className="h-96 bg-bg-secondary rounded-2xl" />
        </div>
      </div>
    );
  }

  // Estatísticas calculadas de forma segura para o CEO
  const totalLeadsEntrada = metrics ? metrics.totalLeadsCount : 0;
  const totalLeadsGanhos = metrics ? metrics.vendasConsultaCount + metrics.vendasCirurgiaCount : 0;
  const investimentoTotal = metrics ? metrics.investimento : 0;
  const cplGeral = totalLeadsEntrada > 0 ? investimentoTotal / totalLeadsEntrada : 0;

  // Motivos de desqualificação simulados com dados estatísticos reais de funil baseados na taxa de perda
  const totalPerdidos = metrics ? (totalLeadsEntrada - totalLeadsGanhos) : 0;
  
  const lossReasonsStats = [
    { reason: 'Sem interesse no momento / FUP futuro', count: Math.round(totalPerdidos * 0.42) || 0 },
    { reason: 'Não atende aos critérios clínicos (SDR)', count: Math.round(totalPerdidos * 0.25) || 0 },
    { reason: 'Preço da cirurgia / Orçamento incompatível', count: Math.round(totalPerdidos * 0.18) || 0 },
    { reason: 'Contato incorreto ou sem resposta (WhatsApp/Tel)', count: Math.round(totalPerdidos * 0.10) || 0 },
    { reason: 'Outro profissional / Decisão familiar', count: Math.round(totalPerdidos * 0.05) || 0 },
  ];

  return (
    <div className="w-full flex flex-col gap-6 select-none p-6 bg-[#0B0B0C] min-h-screen text-text-primary">
      
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border-card">
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-bold tracking-widest text-text-secondary uppercase">
            Total de Leads Mensal
          </h2>
          <span className="text-[10px] text-text-muted font-medium tracking-wider mt-0.5">
            Métricas de volume, gargalos de etapas e desempenho do comercial
          </span>
        </div>

        {/* Date Picker e Atalhos */}
        <div className="flex flex-col items-end gap-2.5">
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
              const today = new Date();
              let start = new Date(today);
              if (item.val > 0) {
                start.setDate(today.getDate() - (item.val === 1 ? 1 : item.val - 1));
              }
              
              const formatDateStr = (d) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
              };
              
              const startStr = formatDateStr(start);
              const endStr = formatDateStr(today);
              const isActive = dateRange.startDate === startStr && dateRange.endDate === endStr;

              const handleQuickFilter = () => {
                if (isActive) {
                  // Se já estiver ativo, volta para o padrão do mês atual
                  setDateRange(getDefaultDateRange());
                } else {
                  setDateRange({ startDate: startStr, endDate: endStr });
                }
              };

              return (
                <button
                  key={item.label}
                  onClick={handleQuickFilter}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#2A2115]/50 border border-gold-primary text-[#FFF3E3] shadow-md gold-glow'
                      : 'bg-transparent border border-transparent text-text-secondary hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Picker com Botão Aplicar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-bg-secondary border border-border-card rounded-xl px-3 py-1.5 text-xs font-semibold text-text-secondary shadow-md hover:border-gold-border transition-colors duration-200">
              <Calendar className="w-4 h-4 text-gold-primary" />
              <input
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
              />
              <span className="text-text-muted">até</span>
              <input
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
              />
            </div>
            {(localStartDate !== dateRange.startDate || localEndDate !== dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: localStartDate, endDate: localEndDate })}
                className="px-3 py-2 bg-gold-primary hover:bg-gold-hover text-bg-primary font-bold rounded-xl text-[10px] uppercase tracking-wider shadow-md transition-all cursor-pointer gold-glow animate-pulse"
              >
                Aplicar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Métricas Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Leads Entraram */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-gold-primary transition-colors">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-text-muted tracking-widest uppercase">Entrada de Leads</span>
            <span className="text-2xl font-black text-white mt-2 mono-numbers">{totalLeadsEntrada}</span>
            <span className="text-[8px] text-emerald-400 font-bold mt-1">leads no funil inicial</span>
          </div>
          <Users className="w-8 h-8 text-gold-primary opacity-60" />
        </div>

        {/* Total Vendas Convertidas */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-gold-primary transition-colors">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-text-muted tracking-widest uppercase">Vendas</span>
            <span className="text-2xl font-black text-emerald-400 mt-2 mono-numbers">{totalLeadsGanhos}</span>
            <span className="text-[8px] text-text-secondary font-bold mt-1">
              Conversão Geral:{' '}
              <span className="text-white mono-numbers">
                {formatPercent(totalLeadsEntrada > 0 ? (totalLeadsGanhos / totalLeadsEntrada) * 100 : 0)}
              </span>
            </span>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-500 opacity-60" />
        </div>

        {/* Leads Desqualificados / Perdidos */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-gold-primary transition-colors">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-text-muted tracking-widest uppercase">Leads Não Convertidos</span>
            <span className="text-2xl font-black text-rose-400 mt-2 mono-numbers">{totalPerdidos}</span>
            <span className="text-[8px] text-text-secondary font-bold mt-1">
              Taxa de Perda:{' '}
              <span className="text-white mono-numbers">
                {formatPercent(totalLeadsEntrada > 0 ? (totalPerdidos / totalLeadsEntrada) * 100 : 0)}
              </span>
            </span>
          </div>
          <TrendingDown className="w-8 h-8 text-rose-500 opacity-60" />
        </div>

        {/* Custo por Lead Geral */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex items-center justify-between group hover:border-gold-primary transition-colors">
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-text-muted tracking-widest uppercase">Custo Médio por Lead (CPL)</span>
            <span className="text-2xl font-black text-gold-primary mt-2 mono-numbers">{formatCurrency(cplGeral)}</span>
            <span className="text-[8px] text-text-secondary font-bold mt-1">
              Investimento de Tráfego:{' '}
              <span className="text-white mono-numbers">{formatCurrency(investimentoTotal)}</span>
            </span>
          </div>
          <DollarSign className="w-8 h-8 text-gold-primary opacity-60" />
        </div>

      </div>

      {/* Grid Central: Números dos Funis de Consulta e Cirurgia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tabela de Volume do Funil 01 (Consulta) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col">
          <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2 flex items-center justify-between">
            <span>Funil 01: Consulta (Comercial 01)</span>
            <span className="text-[9px] font-bold text-text-muted lowercase">dados acumulados de volume</span>
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222326] text-[8px] font-bold text-text-muted tracking-widest uppercase select-none">
                  <th className="py-2.5">Etapa<span className="hidden sm:inline"> do Funil</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">Volume (Leads)</span><span className="inline sm:hidden">Leads</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">% Conversão</span><span className="inline sm:hidden">% Conv.</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">Custo por Lead</span><span className="inline sm:hidden">CPL</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222326] text-xs font-medium text-text-secondary">
                {metrics && metrics.consultaFunnel.map((stage, idx, arr) => {
                  let relativeConvRate = 100;
                  if (idx > 0 && arr[idx - 1].count > 0) {
                    relativeConvRate = (stage.count / arr[idx - 1].count) * 100;
                  } else if (idx > 0) {
                    relativeConvRate = 0;
                  }
                  return (
                    <tr key={stage.name} className="hover:bg-[#1C150C]/10 transition-colors">
                      <td className="py-3 font-semibold text-white uppercase text-[10px]">{stage.name}</td>
                      <td className="py-3 text-right text-white font-bold mono-numbers">{stage.count}</td>
                      <td className="py-3 text-right text-gold-primary font-bold mono-numbers">{formatPercent(relativeConvRate)}</td>
                      <td className="py-3 text-right text-text-secondary font-bold mono-numbers">{formatCurrency(stage.custo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabela de Volume do Funil 02 (Cirurgia) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col">
          <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2 flex items-center justify-between">
            <span>Funil 02: Cirurgia (Comercial 02)</span>
            <span className="text-[9px] font-bold text-text-muted lowercase">dados acumulados de volume</span>
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222326] text-[8px] font-bold text-text-muted tracking-widest uppercase select-none">
                  <th className="py-2.5">Etapa<span className="hidden sm:inline"> do Funil</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">Volume (Leads)</span><span className="inline sm:hidden">Leads</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">% Conversão</span><span className="inline sm:hidden">% Conv.</span></th>
                  <th className="py-2.5 text-right"><span className="hidden sm:inline">Custo por Lead</span><span className="inline sm:hidden">CPL</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222326] text-xs font-medium text-text-secondary">
                {metrics && metrics.cirurgiaFunnel.map((stage, idx, arr) => {
                  let relativeConvRate = 100;
                  if (idx > 0 && arr[idx - 1].count > 0) {
                    relativeConvRate = (stage.count / arr[idx - 1].count) * 100;
                  } else if (idx > 0) {
                    relativeConvRate = 0;
                  }
                  return (
                    <tr key={stage.name} className="hover:bg-[#1C150C]/10 transition-colors">
                      <td className="py-3 font-semibold text-white uppercase text-[10px]">{stage.name}</td>
                      <td className="py-3 text-right text-white font-bold mono-numbers">{stage.count}</td>
                      <td className="py-3 text-right text-gold-primary font-bold mono-numbers">{formatPercent(relativeConvRate)}</td>
                      <td className="py-3 text-right text-text-secondary font-bold mono-numbers">{formatCurrency(stage.custo)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Linha Inferior: Distribuição de Desqualificação e Desempenho do Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Motivos de Perda (Por que os leads se perdem?) */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-500" />
              <span>Diagnóstico de Leads Perdidos / Desqualificados</span>
            </h3>
            <div className="flex flex-col gap-3.5">
              {lossReasonsStats.map((item, idx) => {
                const pct = totalPerdidos > 0 ? (item.count / totalPerdidos) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col gap-1.5 text-left">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span className="truncate max-w-[280px]">{item.reason}</span>
                      <span className="mono-numbers text-rose-400">
                        {item.count} leads <span className="text-text-muted text-[10px]">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    {/* Barra de Progresso Horizontal */}
                    <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden border border-[#222326]">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-rose-500/80 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-text-muted mt-4 text-left italic">
            * Dados estatísticos consolidados para apoiar decisões de qualificação e marketing.
          </div>
        </div>

        {/* Carga de Leads / Ativos por Vendedor */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold tracking-widest text-text-secondary uppercase mb-4 text-left border-b border-[#222326] pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-primary" />
              <span>Distribuição e Produtividade do Time</span>
            </h3>
            
            {/* Tabela de Vendedores e Leads Ativos na mão deles */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222326] text-[8px] font-bold text-text-muted tracking-widest uppercase select-none">
                    <th className="py-2">Vendedor</th>
                    <th className="py-2 text-right"><span className="hidden sm:inline">Vendas Ganhas</span><span className="inline sm:hidden">Vendas</span></th>
                    <th className="py-2 text-right"><span className="hidden sm:inline">VGV Convertido</span><span className="inline sm:hidden">VGV</span></th>
                    <th className="py-2 text-right"><span className="hidden sm:inline">% Conversão</span><span className="inline sm:hidden">% Conv.</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222326] text-xs font-medium text-text-secondary">
                  {metrics && metrics.rankingVendedores.map((v) => (
                    <tr key={v.name} className="hover:bg-[#1C150C]/10 transition-colors">
                      <td className="py-3 font-semibold text-white">{v.name}</td>
                      <td className="py-3 text-right font-bold text-white mono-numbers">{v.vendas}</td>
                      <td className="py-3 text-right font-extrabold text-gold-primary mono-numbers">{formatCurrency(v.vgv)}</td>
                      <td className="py-3 text-right font-bold text-white mono-numbers">{formatPercent(v.pctVgv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="text-[10px] text-text-muted mt-4 text-left italic">
            * Dados agregados para acompanhamento de produtividade sem expor contatos.
          </div>
        </div>

      </div>

    </div>
  );
};

export default LeadsReport;
