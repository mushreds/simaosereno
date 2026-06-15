import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.META_ACCESS_TOKEN;
const adAccountId = process.env.META_AD_ACCOUNT_ID || 'act_537883867807567';
// Garante o prefixo 'act_'
const formattedAdAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;

const baseURL = `https://graph.facebook.com/v18.0`;

const client = axios.create({
  baseURL,
  params: {
    access_token: accessToken
  }
});

/**
 * Busca dados e insights da conta de anúncios do Facebook Ads
 */
export const getCampaignsInsights = async (startDate, endDate) => {
  try {
    if (!accessToken) {
      console.warn('Warning: META_ACCESS_TOKEN is not defined in .env.');
      return { campaignsMeta: [], insightsData: [], dailyData: [] };
    }

    // 1. Obter informações de metadados das campanhas (status, orçamento)
    const campaignsRes = await client.get(`/${formattedAdAccountId}/campaigns`, {
      params: {
        fields: 'id,name,status,daily_budget,lifetime_budget,budget_remaining',
        limit: 100,
        access_token: accessToken
      }
    });
    const campaignsMeta = campaignsRes.data?.data || [];

    // 2. Obter insights de anúncios para as campanhas no período
    const insightsRes = await client.get(`/${formattedAdAccountId}/insights`, {
      params: {
        level: 'campaign',
        fields: 'campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency',
        time_range: JSON.stringify({ since: startDate, until: endDate }),
        limit: 100,
        access_token: accessToken
      }
    });
    const insightsData = insightsRes.data?.data || [];

    // 3. Obter dados agregados por conta para a evolução diária (para o gráfico)
    const dailyRes = await client.get(`/${formattedAdAccountId}/insights`, {
      params: {
        level: 'account',
        time_increment: 1,
        fields: 'date_start,spend,clicks,impressions',
        time_range: JSON.stringify({ since: startDate, until: endDate }),
        limit: 100,
        access_token: accessToken
      }
    });
    const dailyData = dailyRes.data?.data || [];

    return {
      campaignsMeta,
      insightsData,
      dailyData
    };
  } catch (error) {
    console.error('Error fetching Meta Ads data:', error.response?.data || error.message);
    return {
      campaignsMeta: [],
      insightsData: [],
      dailyData: []
    };
  }
};
