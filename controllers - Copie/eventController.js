const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/db');

async function createEvent(req, res) {
  const { title, description, location, date_time, organizer_id } = req.body;
  try {
    const eventId = uuidv4();
    await query(
      'INSERT INTO EVENT (event_id, title, description, location, date_time, organizer_id) VALUES (?, ?, ?, ?, ?, ?)',
      [eventId, title, description, location, date_time, organizer_id]
    );
    res.status(201).json({ message: 'Événement créé', event_id: eventId });
  } catch (err) {
    console.error('Erreur createEvent:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'événement' });
  }
}

async function getEvents(req, res) {
  const { search, category, date } = req.query;

  let baseQuery = 'SELECT * FROM EVENT WHERE 1=1';
  const params = [];

  if (search) {
    baseQuery += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    baseQuery += ' AND category = ?';
    params.push(category);
  }
  if (date) {
    baseQuery += ' AND DATE(date_time) = ?';
    params.push(date);
  }

  try {
    const rows = await query(baseQuery, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Erreur getEvents:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
  }
}

async function getEventById(req, res) {
  try {
    const rows = await query('SELECT * FROM EVENT WHERE event_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Événement non trouvé' });
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Erreur getEventById:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateEvent(req, res) {
  const { title, description, location, date_time } = req.body;
  try {
    await query(
      'UPDATE EVENT SET title = ?, description = ?, location = ?, date_time = ? WHERE event_id = ?',
      [title, description, location, date_time, req.params.id]
    );
    res.status(200).json({ message: 'Événement mis à jour' });
  } catch (err) {
    console.error('Erreur updateEvent:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
}

async function deleteEvent(req, res) {
  try {
    await query('DELETE FROM EVENT WHERE event_id = ?', [req.params.id]);
    res.status(200).json({ message: 'Événement supprimé' });
  } catch (err) {
    console.error('Erreur deleteEvent:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
}
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  next();
}


module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  requireLogin,
  deleteEvent
};