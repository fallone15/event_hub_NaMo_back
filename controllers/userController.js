const { pool } = require('../config/db');

exports.getUserNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM NOTIFICATION WHERE user_id = ? ORDER BY date_time DESC',
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('Erreur getUserNotifications:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE NOTIFICATION SET is_read = TRUE WHERE notification_id = ?',
      [req.params.notificationId]
    );
    res.status(200).json({ message: 'Notification marquée comme lue' });
  } catch (err) {
    console.error('Erreur markNotificationAsRead:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification' });
  }
};
