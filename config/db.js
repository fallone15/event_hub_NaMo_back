require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER,
  password: process.env.DB_PASS ,
  database: process.env.DB_NAME  ,
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

async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error('Erreur SQL:', err);
    throw err;
  }
}

module.exports = { query,pool };
