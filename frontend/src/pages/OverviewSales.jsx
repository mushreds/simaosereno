import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import KPICard from '../components/KPICard';
import FunnelChart from '../components/FunnelChart';
import VendorRanking from '../components/VendorRanking';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import { getOverviewMetrics, getConfig, clearCache } from '../services/api';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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

const OverviewSales = () => {
  // Inicialização de período dinâmica (Mês Atual)
  const [dateRange, setDateRange] = useState(getDefaultDateRange());


  const [filters, setFilters] = useState({
    pipelineId: '',
    consultaType: '',
    formSource: '',
  });

  const [metrics, setMetrics] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Carrega configurações iniciais (metas e investimento)
  const loadConfig = async () => {
    try {
      const configData = await getConfig();
      setConfig(configData);
    } catch (err) {
      console.error('Error fetching config:', err);
      setError('Falha ao carregar as configurações do dashboard.');
    }
  };

  // Carrega as métricas com base no período e filtros selecionados
  const loadMetrics = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      const data = await getOverviewMetrics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        pipelineId: filters.pipelineId,
        consultaType: filters.consultaType,
        formSource: filters.formSource,
      });
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Erro ao carregar dados do Kommo CRM. Verifique as credenciais no .env.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregamento inicial
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadConfig();
      await loadMetrics();
    };
    init();
  }, [dateRange, filters]);

  // Hook de Auto-refresh de 5 minutos (300.000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard metrics...');
      loadMetrics(true);
    }, 300000);

    return () => clearInterval(interval);
  }, [dateRange, filters]);

  // Função para limpar cache e recarregar dados do Kommo
  const handleForceReload = async () => {
    setRefreshing(true);
    try {
      await clearCache();
      await loadMetrics();
    } catch (err) {
      console.error('Error clearing cache:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0B0C] text-white p-6">
        <AlertTriangle className="w-16 h-16 text-gold-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro de Comunicação</h2>
        <p className="text-text-secondary text-sm max-w-md mb-6 text-center">
          {error}
        </p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            loadConfig();
            loadMetrics();
          }}
          className="flex items-center gap-2 bg-gold-primary text-bg-primary hover:bg-gold-hover font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-lg cursor-pointer"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0B0B0C] p-6 flex flex-col gap-6 relative select-none">
      {/* Botão de força refresh flutuante/canto inferior para administradores */}
      <button
        onClick={handleForceReload}
        disabled={refreshing}
        className="absolute bottom-6 right-6 p-3 bg-bg-secondary border border-border-card text-gold-primary hover:text-white rounded-full shadow-2xl hover:border-gold-primary transition-all duration-300 disabled:opacity-50 cursor-pointer z-50 group hover:-rotate-180"
        title="Limpar Cache e Sincronizar com Kommo"
      >
        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* Header com Metas e DatePicker */}
      <Header
        metrics={metrics}
        config={config}
        dateRange={dateRange}
        onDateChange={setDateRange}
      />

      {/* Grid de KPIs Superiores (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="VGV" value={metrics.vgvTotal} formatType="money" />
        <KPICard title="Consulta" value={metrics.taxaConversaoConsulta} formatType="percent" />
        <KPICard title="Cirurgia" value={metrics.taxaConversaoCirurgia} formatType="percent" />
        <KPICard title="Ticket Médio Consulta" value={metrics.ticketMedioConsulta} formatType="money" />
        <KPICard title="Ticket Médio Cirurgia" value={metrics.ticketMedioCirurgia} formatType="money" />
        <KPICard title="Investimento" value={metrics.investimento} formatType="money" />
      </div>

      {/* Grid Principal (Funnels na esquerda / Ranking e Filtros na direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch">
        
        {/* Coluna da Esquerda: Funis */}
        <div className="flex flex-col gap-6 h-full justify-between">
          <div className="flex-1 min-h-[300px]">
            <FunnelChart
              title="Consulta"
              stages={metrics.consultaFunnel}
              conversionRate={metrics.taxaConversaoConsulta}
            />
          </div>
          <div className="flex-1 min-h-[220px]">
            <FunnelChart
              title="Cirurgia"
              stages={metrics.cirurgiaFunnel}
              conversionRate={metrics.taxaConversaoCirurgia}
            />
          </div>
        </div>

        {/* Coluna da Direita: Ranking e Filtros */}
        <div className="flex flex-col gap-6 h-full justify-between">
          <div className="flex-1 min-h-[260px]">
            <VendorRanking vendors={metrics.rankingVendedores} />
          </div>
          <div className="flex-1 min-h-[200px]">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewSales;
