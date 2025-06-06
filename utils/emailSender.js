const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error('Paramètres manquants pour sendMail');
  }

  const msg = {
    to,
    from: process.env.SENDER_EMAIL,
    subject,
    text,
    html,
  };

  try {
    console.log(`Tentative d'envoi d'email à ${to} avec le sujet : ${subject}`);
    await sgMail.send(msg);
    console.log(`📧 Email envoyé à ${to}`);
  } catch (error) {
    console.error('❌ Erreur SendGrid:', error.response?.body || error);
    throw error; // On remonte l'erreur pour que l'appelant puisse gérer
  }
}

module.exports = { sendMail };
