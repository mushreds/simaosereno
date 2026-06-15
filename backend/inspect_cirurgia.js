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

async function inspectCirurgia() {
  try {
    console.log("=== INSPECCIONANDO LEADS DE CIRURGIA (PIPELINE 11649015) ===");
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

    const response = await client.get('/leads', { params });
    const leads = response.data?._embedded?.leads || [];
    
    const cirurgiaLeads = leads.filter(l => l.pipeline_id === 11649015);
    console.log(`Encontrados ${cirurgiaLeads.length} leads de cirurgia em Junho.`);

    cirurgiaLeads.forEach(l => {
      console.log(`- Lead [${l.id}] name: "${l.name}" | Status: ${l.status_id}`);
    });

    // Buscar as etapas do pipeline Comercial 02 (11649015)
    const pipelinesRes = await client.get('/leads/pipelines');
    const pipelines = pipelinesRes.data?._embedded?.pipelines || [];
    const cirurgiaPipe = pipelines.find(p => p.id === 11649015);
    
    if (cirurgiaPipe) {
      console.log(`\nEtapas do pipeline "${cirurgiaPipe.name}":`);
      cirurgiaPipe._embedded?.statuses?.forEach(s => {
        console.log(`- Status [${s.id}]: "${s.name}"`);
      });
    }

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

inspectCirurgia();
