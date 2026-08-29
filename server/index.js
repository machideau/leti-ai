import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Routes API
app.use('/api/chat', chatRouter);

// Sanity check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', model: process.env.HF_MODEL_ID }));

// Servir le build Vue en production
app.use(express.static(join(__dirname, '../client/dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Leti AI server running on http://localhost:${PORT}`);
  console.log(`Model: ${process.env.HF_MODEL_ID}`);
});
