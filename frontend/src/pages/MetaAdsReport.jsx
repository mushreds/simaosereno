import React, { useState, useEffect } from 'react';
import { getMetaAdsMetrics } from '../services/api';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  MousePointerClick, 
  Megaphone, 
  Eye, 
  Activity, 
  CheckCircle, 
  PauseCircle,
  AlertTriangle
} from 'lucide-react';

const MetaAdsReport = () => {
  // Período compatível com o print (Maio e Junho de 2026)
  const [dateRange, setDateRange] = useState({
    startDate: '2026-05-01',
    endDate: '2026-06-30',
  });

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const loadAdsData = async (showIndicator = false) => {
    if (showIndicator) setRefreshing(true);
    try {
      const data = await getMetaAdsMetrics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setMetrics(data);
      if (data?.error) {
        setShowErrorPopup(true);
      } else {
        setShowErrorPopup(false);
      }
    } catch (err) {
      console.error('Error loading Meta Ads metrics:', err);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdsData();
  }, [dateRange]);

  // Formatação de Moeda BRL
  const formatCurrency = (val) => {
    return `R$ ${(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Formatação de Moeda BRL Sem Centavos (para visual compactado)
  const formatCurrencyCompact = (val) => {
    return `R$ ${Math.round(val || 0).toLocaleString('pt-BR')}`;
  };

  // Formatação de Números
  const formatNumber = (val) => {
    return Math.round(val || 0).toLocaleString('pt-BR');
  };

  // Formatação de Porcentagem
  const formatPercent = (val) => {
    return `${((val || 0) * 100).toFixed(2).replace('.', ',')}%`;
  };

  // Formatação de ROAS (ex: 48,86x)
  const formatRoas = (val) => {
    return `${(val || 0).toFixed(2).replace('.', ',')}x`;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0B0B0C] p-6 animate-pulse flex flex-col gap-6">
        <div className="h-12 bg-bg-secondary border border-border-card rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-[#14171B] border border-border-card rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#14171B] border border-border-card rounded-2xl" />
          <div className="h-80 bg-[#14171B] border border-border-card rounded-2xl" />
        </div>
        <div className="h-96 bg-[#14171B] border border-border-card rounded-2xl" />
      </div>
    );
  }

  const summary = metrics ? metrics.summary : {};
  const campaigns = metrics ? metrics.campaigns : [];
  const dailyEvolution = metrics ? metrics.dailyEvolution : [];

  // Configurações do Gráfico SVG de Linha Dupla
  const svgWidth = 900;
  const svgHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 55;
  const paddingTop = 20;
  const paddingBottom = 40;
  const graphWidth = svgWidth - paddingLeft - paddingRight;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  // Encontra máximos para escala dos eixos
  const maxSpend = Math.max(...dailyEvolution.map(d => d.spend)) * 1.15 || 1;
  const maxLeads = Math.max(...dailyEvolution.map(d => d.leads)) * 1.15 || 1;

  // Gera pontos para Spend (Eixo Esquerdo - Dourado)
  const spendPoints = dailyEvolution.map((d, index) => {
    const x = paddingLeft + (index / (dailyEvolution.length - 1)) * graphWidth;
    const y = paddingTop + graphHeight - (d.spend / maxSpend) * graphHeight;
    return { x, y, spend: d.spend, date: d.formattedDate };
  });

  const spendPath = spendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const spendAreaPath = spendPoints.length > 0 
    ? `${spendPath} L ${spendPoints[spendPoints.length - 1].x} ${paddingTop + graphHeight} L ${spendPoints[0].x} ${paddingTop + graphHeight} Z`
    : '';

  // Gera pontos para Leads (Eixo Direito - Azul)
  const leadsPoints = dailyEvolution.map((d, index) => {
    const x = paddingLeft + (index / (dailyEvolution.length - 1)) * graphWidth;
    const y = paddingTop + graphHeight - (d.leads / maxLeads) * graphHeight;
    return { x, y, leads: d.leads, date: d.formattedDate };
  });

  const leadsPath = leadsPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Determinar rótulos no eixo X (evita sobreposição)
  const labelInterval = Math.max(1, Math.floor(dailyEvolution.length / 8));

  return (
    <div className="w-full flex flex-col gap-6 select-none p-6 bg-[#0B0B0C] min-h-screen text-text-primary">
      
      {/* Popup de Erro da API da Meta */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#14171B] border border-red-950 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-950/45 border border-red-900/40 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Erro na API da Meta
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Erro de comunicação com a API da Meta. Por favor, acione o suporte.
              </p>
            </div>
            <button 
              onClick={() => setShowErrorPopup(false)}
              className="mt-2 w-full py-2 bg-red-950/20 hover:bg-red-950/55 border border-red-900/30 rounded-xl text-[10px] font-black text-red-400 uppercase tracking-widest transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Header da Página */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border-card">
        <div className="flex flex-col text-left">
          <h2 className="text-xl font-bold tracking-widest text-text-secondary uppercase">
            Performance de Campanhas (Meta Ads)
          </h2>
          <span className="text-[10px] text-text-muted font-medium tracking-wider mt-0.5">
            Métricas de investimento em anúncios cruzadas com as conversões de vendas no CRM
          </span>
        </div>

        {/* Date Picker e Atalhos */}
        <div className="flex flex-col items-end gap-2.5">
          {/* Atalhos de Tempo Rápidos */}
          <div className="flex items-center gap-1 bg-bg-secondary border border-border-card p-1 rounded-xl shadow-inner">
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
              
              let isActive = dateRange.startDate === startStr && dateRange.endDate === endStr;
              if (item.label === 'Mês') {
                isActive = dateRange.startDate === '2026-05-01' && dateRange.endDate === '2026-06-30';
              }

              const handleQuickFilter = () => {
                if (item.label === 'Mês') {
                  setDateRange({ startDate: '2026-05-01', endDate: '2026-06-30' });
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
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
            />
            <span className="text-text-muted">até</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Grid de 7 KPIs Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        
        {/* Investimento */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">Investimento Ads</span>
            <span className="text-lg font-black text-white mt-1 block mono-numbers">
              {formatCurrencyCompact(summary.totalSpend)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <DollarSign className="w-3.5 h-3.5 text-gold-primary" />
            <span className="text-[8px] text-text-secondary font-bold">Verba total consumida</span>
          </div>
        </div>

        {/* Impressões */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">Impressões</span>
            <span className="text-lg font-black text-white mt-1 block mono-numbers">
              {formatNumber(summary.totalImpressions)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Eye className="w-3.5 h-3.5 text-blue-400 opacity-60" />
            <span className="text-[8px] text-text-secondary font-bold">Visualizações anúncios</span>
          </div>
        </div>

        {/* Cliques */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">Cliques no Link</span>
            <span className="text-lg font-black text-white mt-1 block mono-numbers">
              {formatNumber(summary.totalClicks)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <MousePointerClick className="w-3.5 h-3.5 text-gold-primary" />
            <span className="text-[8px] text-text-secondary font-bold">
              CTR: <span className="text-white mono-numbers">{formatPercent(summary.avgCtr)}</span>
            </span>
          </div>
        </div>

        {/* CPC */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">CPC Médio</span>
            <span className="text-lg font-black text-white mt-1 block mono-numbers">
              {formatCurrency(summary.avgCpc)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Percent className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-[8px] text-text-secondary font-bold">Custo por clique do link</span>
          </div>
        </div>

        {/* Leads */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">Leads Gerados</span>
            <span className="text-lg font-black text-white mt-1 block mono-numbers">
              {formatNumber(summary.totalLeads)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Megaphone className="w-3.5 h-3.5 text-gold-primary" />
            <span className="text-[8px] text-text-secondary font-bold">Leads via formulários</span>
          </div>
        </div>

        {/* CPL */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-colors text-left">
          <div>
            <span className="text-[8px] font-black text-text-muted tracking-widest uppercase block">Custo por Lead (CPL)</span>
            <span className="text-lg font-black text-[#FFF3E3] mt-1 block mono-numbers">
              {formatCurrency(summary.avgCpl)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <Activity className="w-3.5 h-3.5 text-rose-400 opacity-80" />
            <span className="text-[8px] text-text-secondary font-bold">Investimento / Leads</span>
          </div>
        </div>

        {/* ROAS CRM */}
        <div className="bg-[#2A2115]/20 border border-[#817566]/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between group hover:border-gold-primary transition-all text-left gold-glow">
          <div>
            <span className="text-[8px] font-black text-gold-primary tracking-widest uppercase block">ROAS Geral CRM</span>
            <span className="text-lg font-black text-gold-hover mt-1 block mono-numbers">
              {formatRoas(summary.overallRoas || summary.avgRoas || 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[8px] text-text-secondary font-bold">
              VGV Ads: <span className="text-[#FFF3E3] mono-numbers">{formatCurrencyCompact(summary.totalVgv)}</span>
            </span>
          </div>
        </div>

      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Evolução (Investimento vs Leads) */}
        <div className="lg:col-span-2 bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4 text-left">
            <div>
              <h3 className="text-xs font-black tracking-wider text-white uppercase">Evolução Diária da Campanha</h3>
              <span className="text-[9px] text-text-muted">Investimento (Dourado, eixo esq.) vs Leads (Azul, eixo dir.)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-1.5 rounded-sm bg-gold-primary" />
                <span className="text-[8px] font-bold text-text-secondary">Gasto</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-1.5 rounded-sm bg-[#D3DDEE]" />
                <span className="text-[8px] font-bold text-text-secondary">Leads</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            {dailyEvolution.length > 0 ? (
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full select-none">
                <defs>
                  {/* Gradiente para área do Gasto */}
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#817566" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#817566" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Linhas de Grade de Fundo (Horizontal) */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingTop + ratio * graphHeight;
                  return (
                    <line 
                      key={i} 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={paddingLeft + graphWidth} 
                      y2={y} 
                      stroke="#24282F" 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                    />
                  );
                })}

                {/* Preenchimento de Área (Gasto) */}
                {spendAreaPath && (
                  <path d={spendAreaPath} fill="url(#spendGradient)" />
                )}

                {/* Linhas Principais */}
                {spendPath && (
                  <path d={spendPath} fill="none" stroke="#817566" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {leadsPath && (
                  <path d={leadsPath} fill="none" stroke="#D3DDEE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Eixo X: Rótulos das Datas */}
                {dailyEvolution.map((d, index) => {
                  if (index % labelInterval !== 0 && index !== dailyEvolution.length - 1) return null;
                  const x = paddingLeft + (index / (dailyEvolution.length - 1)) * graphWidth;
                  return (
                    <g key={index}>
                      <line x1={x} y1={paddingTop + graphHeight} x2={x} y2={paddingTop + graphHeight + 4} stroke="#24282F" strokeWidth="1" />
                      <text 
                        x={x} 
                        y={paddingTop + graphHeight + 16} 
                        fill="#686868" 
                        fontSize="8.5" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {d.formattedDate}
                      </text>
                    </g>
                  );
                })}

                {/* Eixo Esquerdo: Valores de Spend */}
                <text x={paddingLeft - 8} y={paddingTop + 4} fill="#817566" fontSize="8.5" fontWeight="bold" textAnchor="end">
                  {formatCurrencyCompact(maxSpend)}
                </text>
                <text x={paddingLeft - 8} y={paddingTop + graphHeight} fill="#817566" fontSize="8.5" fontWeight="bold" textAnchor="end">
                  R$ 0
                </text>

                {/* Eixo Direito: Valores de Leads */}
                <text x={paddingLeft + graphWidth + 8} y={paddingTop + 4} fill="#D3DDEE" fontSize="8.5" fontWeight="bold" textAnchor="start">
                  {Math.round(maxLeads)} L
                </text>
                <text x={paddingLeft + graphWidth + 8} y={paddingTop + graphHeight} fill="#D3DDEE" fontSize="8.5" fontWeight="bold" textAnchor="start">
                  0 L
                </text>
              </svg>
            ) : (
              <span className="text-[10px] text-text-muted">Sem dados disponíveis</span>
            )}
          </div>
        </div>

        {/* Divisão de Investimento por Campanha */}
        <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="text-left mb-4">
            <h3 className="text-xs font-black tracking-wider text-white uppercase">Divisão de Investimento</h3>
            <span className="text-[9px] text-text-muted">Percentual de verba alocado por campanha</span>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            {campaigns.map((camp) => {
              const sharePercent = summary.totalSpend > 0 ? (camp.spend / summary.totalSpend) * 100 : 0;
              return (
                <div key={camp.id} className="flex flex-col gap-1 text-left">
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="text-text-secondary truncate max-w-[170px]" title={camp.name}>
                      {camp.name.replace('Dr. Simão - ', '')}
                    </span>
                    <span className="mono-numbers text-gold-primary">{sharePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E232A] rounded-full overflow-hidden border border-[#24282F]">
                    <div 
                      className="h-full bg-gold-gradient rounded-full" 
                      style={{ width: `${sharePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[7px] text-text-muted font-semibold">
                    <span>Gasto: {formatCurrencyCompact(camp.spend)}</span>
                    <span>Leads: {camp.leads}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Tabela de Detalhamento das Campanhas */}
      <div className="bg-[#14171B] border border-border-card rounded-2xl p-5 shadow-lg">
        <div className="text-left mb-4">
          <h3 className="text-xs font-black tracking-wider text-white uppercase">Detalhamento das Campanhas</h3>
          <span className="text-[9px] text-text-muted">Métricas ponta a ponta: do anúncio ao VGV final gerado no CRM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] text-left border-collapse select-none">
            <thead>
              <tr className="border-b border-border-card text-text-muted uppercase tracking-widest font-black text-[8px]">
                <th className="py-3 px-2">Campanha</th>
                <th className="py-3 px-2 text-center hidden md:table-cell">Status</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">Orçamento</th>
                <th className="py-3 px-2 text-right">Gasto</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">Impressões</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">Cliques</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">CTR</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">CPC</th>
                <th className="py-3 px-2 text-right">Leads</th>
                <th className="py-3 px-2 text-right">CPL</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">Vendas</th>
                <th className="py-3 px-2 text-right hidden md:table-cell">VGV CRM</th>
                <th className="py-3 px-2 text-right text-gold-primary">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2127]">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#1E232A]/40 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-white max-w-[120px] sm:max-w-[200px] truncate" title={camp.name}>
                    {camp.name.replace('Dr. Simão - ', '')}
                  </td>
                  <td className="py-3.5 px-2 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center">
                      {camp.status === 'ACTIVE' ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[7.5px] uppercase tracking-wider">
                          <CheckCircle className="w-2.5 h-2.5" /> Ativa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold text-[7.5px] uppercase tracking-wider">
                          <PauseCircle className="w-2.5 h-2.5" /> Pausada
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers font-medium text-text-secondary hidden md:table-cell">
                    {camp.budget > 0 ? formatCurrencyCompact(camp.budget) : '—'}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers font-medium text-text-secondary">
                    {formatCurrencyCompact(camp.spend)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary hidden md:table-cell">
                    {formatNumber(camp.impressions)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary hidden md:table-cell">
                    {formatNumber(camp.clicks)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary hidden md:table-cell">
                    {formatPercent(camp.ctr)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary hidden md:table-cell">
                    {formatCurrency(camp.cpc)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-white font-bold">
                    {formatNumber(camp.leads)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary">
                    {formatCurrency(camp.cpl)}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-emerald-400 font-bold hidden md:table-cell">
                    {camp.conversions}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary hidden md:table-cell">
                    {camp.vgv > 0 ? formatCurrencyCompact(camp.vgv) : 'R$ 0'}
                  </td>
                  <td className="py-3.5 px-2 text-right mono-numbers font-extrabold text-gold-primary">
                    {camp.roas > 0 ? formatRoas(camp.roas) : '0,00x'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MetaAdsReport;
