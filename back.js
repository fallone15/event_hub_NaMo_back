const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 5000;

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true,
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'front_end')));

app.use(session({
  secret: '9c3b7fbb1a9d0a3dff2e8c2e1a5a4b6e9c7f8a2b5d6e7f1c9b3a0d2f4e6c8a7b',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000  // session valide 7 jours
  }
}));

// Middleware pour afficher la session à chaque requête (debug)
app.use((req, res, next) => {
  console.log('Session utilisateur:', req.session.user);
  next();
});

// Routes
app.use('/api/auth', require('./route/authentificationroute'));
app.use('/api/events', require('./route/eventsroutes'));
app.use('/api/attendance', require('./route/attendance_route'));
app.use('/api/notifications', require('./route/userroutes'));


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

