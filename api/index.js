// Vercel Serverless Function entry point
// The build.sh script copies backend/src into api/src/ before deployment
import app from './src/server.js';

export default app;
