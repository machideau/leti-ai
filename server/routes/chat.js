import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { messages, modelId, systemPrompt } = req.body;
  const token    = process.env.HF_TOKEN;
  const model    = modelId || process.env.HF_MODEL_ID || 'google/gemma-3-4b-it';
  const system   = systemPrompt || 'Tu es Leti AI, un assistant IA expert, bienveillant et très compétent.';
  const url      = `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;

  const body = JSON.stringify({
    model,
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      { role: 'system', content: system },
      ...(messages || [])
    ]
  });

  let hfResponse;
  try {
    hfResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body
    });
  } catch (e) {
    return res.status(502).json({ error: `Impossible de contacter Hugging Face : ${e.message}` });
  }

  if (!hfResponse.ok) {
    const text = await hfResponse.text();
    const msg =
      hfResponse.status === 401 ? 'Token Hugging Face invalide ou manquant.' :
      hfResponse.status === 503 ? `Modèle en cours de chargement. Réessayez dans quelques secondes.` :
      hfResponse.status === 404 ? `Modèle introuvable : ${model}` :
      `Erreur HF (${hfResponse.status}) : ${text.slice(0, 200)}`;
    return res.status(hfResponse.status).json({ error: msg });
  }

  // Pipe le stream SSE directement vers le client
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const reader = hfResponse.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
  } catch (e) {
    res.write(`data: {"error":"${e.message}"}\n\n`);
  } finally {
    res.end();
  }
});

export default router;
