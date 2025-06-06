const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { query } = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user_id = uuidv4();
    const role = 'REGULAR';

    await query(
      'INSERT INTO USER (user_id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const users = await query('SELECT * FROM USER WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({ message: 'Connexion réussie', user: req.session.user });
  } catch (err) {
    console.error('Erreur lors du login:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erreur lors de la déconnexion :', err);
      return res.status(500).json({ error: 'Erreur de déconnexion' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Déconnexion réussie' });
  });
};

exports.status = (req, res) => {
  if (req.session && req.session.user) {
    res.json({ loggedIn: true, user_id: req.session.user.user_id });
  } else {
    res.json({ loggedIn: false });
  }
};
