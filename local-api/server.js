import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = {
  subscription: [], clip: [], purchase: [], review: [], withdrawal: [],
  playerprofile: [], team: [], folder: []
};

let idCounter = 1;
const makeId = () => String(idCounter++);

const entityName = (name) => name.toLowerCase();

app.get('/entities/:entity', (req, res) => {
  const e = entityName(req.params.entity);
  res.json(db[e] || []);
});

app.post('/entities/:entity/filter', (req, res) => {
  const e = entityName(req.params.entity);
  const q = req.body || {};
  const list = (db[e] || []).filter(item =>
    Object.keys(q).every(k => String(item[k]) === String(q[k]))
  );
  res.json(list);
});

app.post('/entities/:entity', (req, res) => {
  const e = entityName(req.params.entity);
  const item = { id: makeId(), ...req.body };
  db[e] = db[e] || [];
  db[e].push(item);
  res.status(201).json(item);
});

app.put('/entities/:entity/:id', (req, res) => {
  const e = entityName(req.params.entity);
  const id = req.params.id;
  db[e] = db[e] || [];
  const idx = db[e].findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db[e][idx] = { ...db[e][idx], ...req.body };
  res.json(db[e][idx]);
});

app.delete('/entities/:entity/:id', (req, res) => {
  const e = entityName(req.params.entity);
  const id = req.params.id;
  db[e] = db[e] || [];
  const idx = db[e].findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = db[e].splice(idx, 1)[0];
  res.json(removed);
});

let currentUser = { 
  id: 'u1', 
  email: 'user@example.com', 
  full_name: 'Local User',
  user_type: 'creator',  // Add this line
  role: 'user'
};
app.get('/auth/me', (req, res) => res.json(currentUser));
app.get('/auth/is-authenticated', (req, res) => res.json({ authenticated: true }));
app.post('/auth/logout', (req, res) => res.json({ ok: true }));
app.put('/auth/me', (req, res) => {
  currentUser = { ...currentUser, ...req.body };
  res.json(currentUser);
});

app.post('/functions/:name', (req, res) => {
  const name = req.params.name;
  res.json({ function: name, payload: req.body });
});

app.post('/integrations/core/:method', (req, res) => {
  const method = req.params.method;
  res.json({ method, args: req.body });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Local API listening on http://localhost:${PORT}`));