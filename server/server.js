const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

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

app.post('/api/password', (req, res) => {
  console.log(process.env.ADMIN_PASSWORD)
  const password = req.body.password
  if (password === process.env.ADMIN_PASSWORD) {
    res.status(200).send()
  } else {
    res.status(403).send()
  }
})


app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;


  let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASSWORD 
    }
  });

  try {
    await transporter.sendMail({
      replyTo: email,
      to: process.env.MAILUSER,
      from: `"${name}" <${process.env.MAIL_FROM}>`, 
      subject: `Message de ${name}`,
      text: message
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));


app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
