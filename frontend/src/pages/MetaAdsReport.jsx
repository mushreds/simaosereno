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

const MetaAdsReport = () => {
  // Inicialização de período dinâmica (Mês Atual)
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

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
  const campaigns = metrics ? (metrics.campaigns || []).filter(c => (c.spend || 0) > 0) : [];
  const dailyEvolution = metrics ? metrics.dailyEvolution : [];

  // Mapeia o resultado principal da campanha de forma personalizada
  const getCampaignResult = (camp) => {
    const name = camp.name.toUpperCase();
    if (name.includes('SITE') || name.includes('RMKT') || name.includes('LEAD') || name.includes('CADASTRO')) {
      return {
        label: 'Lead (Cadastro)',
        value: camp.leads || 0
      };
    } else if (name.includes('VIDEO VIEW') || name.includes('THRUPLAY') || name.includes('TRUEPLAY')) {
      return {
        label: 'Thruplay',
        value: camp.thruplays || 0
      };
    } else if (name.includes('VISITAS AO PERFIL') || name.includes('TRÁFEGO-IG') || name.includes('SEGUIDORES')) {
      return {
        label: 'Visitas ao Perfil',
        value: camp.clicks || 0
      };
    } else {
      return {
        label: 'Resultado',
        value: camp.leads || camp.clicks || 0
      };
    }
  };

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
              
              let isActive = dateRange.startDate === startStr && dateRange.endDate === endStr;
              if (item.label === 'Mês') {
                const currentMonthRange = getDefaultDateRange();
                isActive = dateRange.startDate === currentMonthRange.startDate && dateRange.endDate === currentMonthRange.endDate;
              }

              const handleQuickFilter = () => {
                if (item.label === 'Mês') {
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
                <th className="py-3 px-2 text-center">Status</th>
                <th className="py-3 px-2 text-right">Gasto</th>
                <th className="py-3 px-2 text-right">Impressões</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2127]">
              {campaigns.map((camp) => {
                return (
                  <tr key={camp.id} className="hover:bg-[#1E232A]/40 transition-colors">
                    <td className="py-3.5 px-2 font-bold text-white max-w-[120px] sm:max-w-[200px] truncate" title={camp.name}>
                      {camp.name.replace('Dr. Simão - ', '')}
                    </td>
                    <td className="py-3.5 px-2 text-center">
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
                    <td className="py-3.5 px-2 text-right mono-numbers font-medium text-text-secondary">
                      {formatCurrencyCompact(camp.spend)}
                    </td>
                    <td className="py-3.5 px-2 text-right mono-numbers text-text-secondary">
                      {formatNumber(camp.impressions)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MetaAdsReport;
