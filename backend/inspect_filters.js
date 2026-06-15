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

// Filtros extraídos da URL
const urlFilters = {
  "11626995": ["101033719", "101084843", "101537307", "104676051", "92628163", "92648831", "93645571", "93645575", "95292807", "95292811", "96003771"],
  "11649015": ["101534923", "101534991", "92628651", "92628655", "92628659", "92647035", "92648875"],
  "11649019": ["101036711", "102712215", "142", "143", "92627555"],
  "12010351": ["92644687"],
  "12121895": ["93589023", "93589027", "93589031"],
  "13103191": ["101033907", "101033911", "101033915", "101037979"],
  "13135035": ["101286059", "101286063", "101288607", "104668351", "104668395", "104668399"],
  "13327895": ["102785703", "102785707", "102785711", "104648747", "104648751", "104648755", "104648759", "104648763", "104648767"]
};

async function inspectFilters() {
  try {
    console.log("=== INSPECCIONANDO LEADS DE JUNHO 2026 COM FILTROS DA URL ===");
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
      const response = await client.get('/leads', { params });
      const leads = response.data?._embedded?.leads || [];
      allLeads = [...allLeads, ...leads];

      if (response.data?._links?.next && leads.length === params.limit) {
        params.page += 1;
      } else {
        hasMore = false;
      }
    }

    console.log(`Total de leads em Junho (sem filtros adicionais): ${allLeads.length}`);

    // Aplicar filtros da URL
    const filteredByUrl = allLeads.filter(lead => {
      const pipeIdStr = String(lead.pipeline_id);
      const statusIdStr = String(lead.status_id);
      
      // Verifica se a pipeline do lead está no filtro da URL
      if (!urlFilters[pipeIdStr]) {
        return false;
      }
      
      // Verifica se a etapa do lead está listada no filtro daquela pipeline
      return urlFilters[pipeIdStr].includes(statusIdStr);
    });

    console.log(`Total de leads filtrados pela URL exata: ${filteredByUrl.length}`);

    // Mostrar os leads que foram filtrados e seus status/pipelines
    console.log("\nDistribuição dos leads filtrados por Pipeline:");
    const counts = {};
    filteredByUrl.forEach(l => {
      counts[l.pipeline_id] = (counts[l.pipeline_id] || 0) + 1;
    });
    for (const [pipeId, count] of Object.entries(counts)) {
      console.log(`- Pipeline ID: ${pipeId} | Leads: ${count}`);
    }

    // Mostrar também quais leads foram descartados e por quê
    const discarded = allLeads.filter(lead => !filteredByUrl.includes(lead));
    console.log(`\nTotal de leads descartados: ${discarded.length}`);
    console.log("Amostra de leads descartados:");
    discarded.slice(0, 10).forEach(l => {
      console.log(`- Lead [${l.id}] no Pipeline ${l.pipeline_id} com Status ${l.status_id}`);
    });

  } catch (error) {
    console.error("Erro:", error.message);
  }
}

inspectFilters();
