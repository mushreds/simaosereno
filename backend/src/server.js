import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuração de CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Permite: sem origin (mobile/curl), localhost, e qualquer subdomínio vercel.app
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Logger simples de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas da API
// Na Vercel, api/index.js já é servido em /api/*, então as rotas ficam na raiz
// Localmente, montamos em /api para corresponder ao proxy do Vite
if (process.env.VERCEL) {
  app.use('/', apiRouter);
} else {
  app.use('/api', apiRouter);
}

// Rota de status do servidor
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Middleware de tratamento de erros (impede a exibição de tokens em stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  
  // Sanitiza a mensagem de erro para não vazar o token caso apareça na URL ou headers
  const sanitizedMessage = err.message.replace(/Bearer\s[a-zA-Z0-9\-_.]+/g, 'Bearer [REDACTED]');
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : sanitizedMessage
  });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}

export default app;
