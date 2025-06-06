//const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../utils/emailSender');
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

pool.getConnection()
  .then(conn => {
    console.log('Connecté à la base de données MySQL !');
    conn.release();
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données MySQL :', err);
  });

async function getOrganizerData(event_id) {
  let conn;
  try {
    // Vérification que pool est bien configuré
    if (!pool || typeof pool.getConnection !== 'function') {
      throw new Error('Pool de connexion non initialisé correctement');
    }

    conn = await pool.getConnection();
    console.log('Connexion obtenue avec succès');

    const [rows] = await conn.query(`
      SELECT U.email AS organizer_email, U.user_id AS organizer_id
      FROM EVENT E
      JOIN USER U ON E.organizer_id = U.user_id
      WHERE E.event_id = ?
    `, [event_id]);

    if (rows.length === 0) return null;
    console.log(rows);
    return {
      email: rows[0].organizer_email,
      user_id: rows[0].organizer_id
    };
  } catch (error) {
    console.error('Erreur dans getOrganizerData:', error);
    return null;
  } finally {
    if (conn) conn.release();
  }
}

// 🔍 Récupère l'email et le username de l'utilisateur inscrit
async function getUserEmail(user_id) {
  try {
    const [rows] = await pool.query(`
      SELECT email, username
      FROM USER
      WHERE user_id = ?
    `, [user_id]);

    if (!rows || rows.length === 0 || !rows[0]) {
      return null;
    }

    return {
      email: rows[0].email,
      username: rows[0].username
    };
  } catch (err) {
    console.error('Erreur dans getUserEmail:', err);
    return null;
  }
}

// ✅ RSVP à un événement (inscription + e-mails + notifications)
exports.rsvpToEvent = async (req, res) => {
  const { user_id, event_id, rsvp_status } = req.body;

  if (!user_id || !event_id) {
    return res.status(400).json({ error: "user_id et event_id sont requis." });
  }

  const status = rsvp_status || 'INTERESTED';

  try {
    // 1️⃣ Enregistrement du RSVP
    await pool.query(`
      INSERT INTO USER_EVENT (user_id, event_id, rsvp_status)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rsvp_status = VALUES(rsvp_status)
    `, [user_id, event_id, status]);

    // 2️⃣ Infos organisateur
    const orgData = await getOrganizerData(event_id);
    if (!orgData) {
      return res.status(404).json({ error: "Organisateur introuvable pour cet événement." });
    }

    // 3️⃣ Infos utilisateur
    const userData = await getUserEmail(user_id);
    if (!userData) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const { email: organizerEmail, user_id: organizerId } = orgData;
    const { email: userEmail, username } = userData;

    // 4️⃣ Envoi e-mail à l'organisateur
    await sendMail({
      to: organizerEmail,
      subject: 'Nouvelle inscription à votre événement',
      html: `
        <p>Bonjour,</p>
        <p>L'utilisateur <strong>${username}</strong> vient de s'inscrire à votre événement (ID : ${event_id}).</p>
        <p>Statut RSVP : <em>${status}</em>.</p>
        <br><p>Cordialement,<br/>EventHub</p>
      `,
      text: `
        Bonjour,

        L'utilisateur ${username} s'est inscrit à votre événement (ID : ${event_id}).
        Statut RSVP : ${status}.

        Cordialement,
        EventHub
      `
    });

    // 5️⃣ Notification organisateur
    const notificationIdOrg = uuidv4();
    const messageOrg = `Nouvelle inscription par ${username} (statut : ${status}) à l'événement ${event_id}`;
    await pool.query(`
      INSERT INTO NOTIFICATION (notification_id, message, user_id, event_id)
      VALUES (?, ?, ?, ?)
    `, [notificationIdOrg, messageOrg, organizerId, event_id]);

    // 6️⃣ Envoi e-mail à l'utilisateur
    await sendMail({
      to: userEmail,
      subject: 'Confirmation de votre inscription',
      html: `
        <p>Bonjour ${username},</p>
        <p>Vous êtes bien inscrit(e) à l'événement (ID : ${event_id}).</p>
        <p>Statut RSVP : <em>${status}</em>.</p>
        <br><p>Merci pour votre participation !<br/>EventHub</p>
      `,
      text: `
        Bonjour ${username},

        Vous êtes bien inscrit(e) à l'événement (ID : ${event_id}).
        Statut RSVP : ${status}.

        Merci pour votre participation !

        Cordialement,
        EventHub
      `
    });

    // 7️⃣ Notification utilisateur
    const notificationIdUser = uuidv4();
    const messageUser = `Vous êtes inscrit(e) à l'événement ${event_id} (statut : ${status})`;
    await pool.query(`
      INSERT INTO NOTIFICATION (notification_id, message, user_id, event_id)
      VALUES (?, ?, ?, ?)
    `, [notificationIdUser, messageUser, user_id, event_id]);

    return res.status(200).json({ message: 'RSVP enregistré, e-mails et notifications envoyés.' });
  } catch (err) {
    console.error('❌ Erreur RSVP ou notifications :', err);
    return res.status(500).json({ error: 'Erreur interne lors du traitement du RSVP.' });
  }
};

exports.isRegisteredToEvent = async (req, res) => {
  const { eventId, userId } = req.params;

  if (!eventId || !userId) {
    return res.status(400).json({ error: "eventId et userId requis" });
  }

  try {
    const result = await pool.query(`
      SELECT * FROM USER_EVENT
      WHERE event_id = ? AND user_id = ?
    `, [eventId, userId]);

    console.log("Résultat brut query :", result);

    const [rows] = result;

    if (!rows) {
      return res.status(500).json({ error: "Erreur inattendue. Aucun résultat." });
    }

    const registered = rows.length > 0;
    return res.status(200).json({ registered });
  } catch (error) {
    console.error("❌ Erreur vérification inscription :", error);
    return res.status(500).json({ error: "Erreur serveur interne" });
  }
};
