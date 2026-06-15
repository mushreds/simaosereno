import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const subDomain = process.env.KOMMO_SUBDOMAIN || 'simaosereno';
const token = process.env.KOMMO_TOKEN;
const baseURL = `https://${subDomain}.kommo.com/api/v4`;

console.log("Subdomain:", subDomain);

const client = axios.create({
  baseURL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

async function runTest() {
  try {
    console.log("=== TESTANDO CONEXÃO COM KOMMO ===");
    
    console.log("1. Buscando pipelines...");
    const pipelinesRes = await client.get('/leads/pipelines');
    const pipelines = pipelinesRes.data?._embedded?.pipelines || [];
    console.log(`Encontrados ${pipelines.length} pipelines:`);
    pipelines.forEach(p => {
      console.log(`- Pipeline [${p.id}]: "${p.name}" (Is Main: ${p.is_main})`);
      console.log("  Etapas:");
      p._embedded?.statuses?.forEach(s => {
        console.log(`    * Status [${s.id}]: "${s.name}" (Color: ${s.color})`);
      });
    });

    console.log("\n2. Buscando usuários/vendedores...");
    const usersRes = await client.get('/users');
    const users = usersRes.data?._embedded?.users || [];
    console.log(`Encontrados ${users.length} usuários:`);
    users.forEach(u => {
      console.log(`- Usuário [${u.id}]: "${u.name}" (${u.email})`);
    });

    console.log("\n3. Buscando custom fields...");
    const cfRes = await client.get('/leads/custom_fields');
    const customFields = cfRes.data?._embedded?.custom_fields || [];
    console.log(`Encontrados ${customFields.length} campos personalizados:`);
    customFields.forEach(f => {
      console.log(`- Campo [${f.id}]: "${f.name}" (${f.type})`);
      if (f.enums) {
        console.log("  Opções:", f.enums);
      }
    });

    console.log("\n4. Buscando últimos 5 leads para ver estrutura...");
    const leadsRes = await client.get('/leads', { params: { limit: 5 } });
    const leads = leadsRes.data?._embedded?.leads || [];
    console.log(`Encontrados ${leads.length} leads de amostra.`);
    leads.forEach(l => {
      console.log(`- Lead [${l.id}]: "${l.name}" | Price: ${l.price} | Pipeline: ${l.pipeline_id} | Status: ${l.status_id}`);
      if (l.custom_fields_values) {
        console.log("  Campos preenchidos:");
        l.custom_fields_values.forEach(cf => {
          console.log(`    * ${cf.field_name} (ID: ${cf.field_id}):`, cf.values.map(v => v.value));
        });
      }
    });

  } catch (error) {
    console.error("Erro no teste:", error.response?.status, error.response?.data || error.message);
  }
}

runTest();
