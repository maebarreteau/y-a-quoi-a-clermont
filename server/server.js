const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;


app.use(cors());


app.use(express.json());


app.use(express.static('public'));


let events = [
];


app.get('/api/events', (req, res) => {
  res.json(events);
});

app.get('/admin', (req, res) => {
  res.sendFile('admin.html', { root: 'public' });
});


app.post('/api/events', (req, res) => {
  const newEvent = { id: events.length + 1, ...req.body };
  events.push(newEvent);
  res.json(newEvent);
});

app.delete('/api/events/:id', (req, res) => {
  const id = parseInt(req.params.id);
  events = events.filter(e => e.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
