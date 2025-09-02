
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// In-memory store. Replace with DB in production.
// Structure: { [key: string]: { updatedAt: number, students: Array<any> } }
const store = new Map();

function makeKey(branch, semester, batch){
  return `results_${branch}_${semester}_${batch}`;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/results', (req, res) => {
  const { branch, semester, batch } = req.query;
  if(!branch || !semester || !batch){
    return res.status(400).json({ error: 'branch, semester, batch are required' });
  }
  const key = makeKey(branch, semester, batch);
  const data = store.get(key) || { updatedAt: 0, students: [] };
  res.json(data);
});

app.post('/api/results', (req, res) => {
  const { branch, semester, batch, students } = req.body || {};
  if(!branch || !semester || !batch || !Array.isArray(students)){
    return res.status(400).json({ error: 'branch, semester, batch, students[] required' });
  }
  const key = makeKey(branch, semester, batch);
  const payload = { updatedAt: Date.now(), students };
  store.set(key, payload);
  res.json({ ok: true });
});

app.delete('/api/results', (req, res) => {
  const { branch, semester, batch } = req.query;
  if(!branch || !semester || !batch){
    return res.status(400).json({ error: 'branch, semester, batch are required' });
  }
  const key = makeKey(branch, semester, batch);
  store.delete(key);
  res.json({ ok: true });
});

app.delete('/api/results/all', (_req, res) => {
  store.clear();
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


