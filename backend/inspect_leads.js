import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const subDomain = process.env.KOMMO_SUBDOMAIN || 'simaosereno';
const token = process.env.KOMMO_TOKEN;
const baseURL = `https://${subDomain}.kommo.com/api/v4`;

const client = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function inspectLeads() {
  try {
    console.log("=== INSPECCIONANDO LEADS DE JUNHO 2026 ===");
    const startDate = '2026-06-01';
    const endDate = '2026-06-30';
    const startTimestamp = Math.floor(new Date(`${startDate}T00:00:00`).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(`${endDate}T23:59:59`).getTime() / 1000);

    const params = {
      limit: 250,
      page: 1,
      'filter[created_at][from]': startTimestamp,
      'filter[created_at][to]': endTimestamp
    };

    let allLeads = [];
    let hasMore = true;

    while (hasMore) {
      console.log(`Buscando página ${params.page} de leads...`);
      const response = await client.get('/leads', { params });
      const leads = response.data?._embedded?.leads || [];
      allLeads = [...allLeads, ...leads];

      if (response.data?._links?.next && leads.length === params.limit) {
        params.page += 1;
      } else {
        hasMore = false;
      }
    }

    console.log(`Total de leads retornados no período: ${allLeads.length}`);

    // Agrupar por pipeline_id
    const pipelineCounts = {};
    allLeads.forEach(l => {
      pipelineCounts[l.pipeline_id] = (pipelineCounts[l.pipeline_id] || 0) + 1;
    });

    // Buscando nomes das pipelines para mapear os IDs
    const pipelinesRes = await client.get('/leads/pipelines');
    const pipelines = pipelinesRes.data?._embedded?.pipelines || [];
    const pipelinesMap = {};
    pipelines.forEach(p => {
      pipelinesMap[p.id] = p.name;
    });

    console.log("\nMapeamento dos Leads com Nome do Pipeline:");
    let totalSpecificPipes = 0;
    const allowedPipes = [
      11626995, // Comercial 01
      11649015, // Comercial 02
      11649019, // Comercial 02 start/Start - Comercial 2
      12010351, // Legado
      12121895, // Importação
      13103191, // Follow-up / Repescagem
      13135035, // Instagram - Social Seller
      13327895  // Start - Comercial 2
    ];

    for (const [pipeId, count] of Object.entries(pipelineCounts)) {
      const idNum = parseInt(pipeId, 10);
      const name = pipelinesMap[pipeId] || 'Desconhecido';
      const isAllowed = allowedPipes.includes(idNum);
      if (isAllowed) {
        totalSpecificPipes += count;
      }
      console.log(`- Pipeline "${name}" (ID: ${pipeId}) | Leads: ${count} | Filtrado no Link: ${isAllowed ? 'SIM' : 'NÃO'}`);
    }

    console.log(`\nSoma dos leads nas pipelines filtradas no link: ${totalSpecificPipes}`);

  } catch (error) {
    console.error("Erro na inspeção:", error.response?.status, error.response?.data || error.message);
  }
}

inspectLeads();
