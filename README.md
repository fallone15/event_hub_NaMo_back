# Campus Events Hub - Backend

Ce dépôt contient la partie **backend** de l'application Campus Events Hub. Elle est développée avec **Node.js** et **Express**, et permet de gérer les utilisateurs, les événements, les inscriptions, ainsi que les sessions.


## 🧩 Fonctionnalités principales

- Authentification des utilisateurs (connexion, session, middleware sécurisé)
- Création, mise à jour, suppression et consultation des événements
- Inscriptions (RSVP) aux événements
- Gestion des notifications
- API REST sécurisée
- Connexion à une base de données **MySQL**

## 📁 Structure des fichiers

<pre> /front_end │ ├── css/ │ ├── projettry2.css → Feuille de style principale │ ├── register.css → Style pour la page d’inscription │ └── login.css → Style pour la page de connexion │ ├── js/ │ ├── event_projecttry2.js → Script pour la page browse-events │ └── events.js → Script pour affichage + inscriptions │ ├── home.html → Page d’accueil ├── login.html → Page de connexion ├── register.html → Page d’inscription ├── events.html → Liste et détails des événements └── LICENSE → Fichier de licence </pre>


## ⚙️ Installation
 Cloner le dépôt :
```bash
git clone https://github.com/ton-utilisateur/nom-du-repo.git
cd back_end
```

## Configuration du fichier .env
creer un fichier `.env`a la racine de ton projet
```env
DB_HOST=localhost
DB_USER=ton_user
DB_PASSWORD=ton_mdp
DB_NAME=nom_de_ta_db
SESSION_SECRET=un_secret_long
SENDGRID_API_KEY=ta_clef_sendgrid
```

## lancement du serveur 
```bash 
node index.js
```
Le serveur devrait démarrer et être accessible sur l'adresse indiquée dans la console (souvent http://localhost:5000).

## notes

📌 Points d’accès API
POST /api/auth/login → Connexion

GET /api/auth/status → Vérifie si l’utilisateur est connecté

GET /api/events → Liste des événements

GET /api/events/:id → Détail d’un événement

POST /api/attendance → Inscription à un événement

GET /api/events/:id/registration-status/:user_id → Vérifie l’inscription

GET /api/user/:id/notifications → Notifications d’un utilisateur

POST /api/user/:id/notifications → Créer une notification pour un utilisateur

## Fonctionnalité d’envoi d’e-mails avec SendGrid

Ce backend utilise **SendGrid** pour gérer l’envoi d’e-mails, notamment pour les notifications et les confirmations d'inscription.

- L’intégration est réalisée via l’API SendGrid.
- Le service d’envoi est encapsulé dans une fonction (par exemple `sendMail`) pour faciliter l’utilisation dans le code.
- Lorsqu’un utilisateur s’inscrit à un événement, un e-mail de confirmation est automatiquement envoyé via SendGrid a l'organisateur de l'evenement et à l'utilisateur 
- Le système crée également une notification en base de données en lien avec cet envoi.

Pour utiliser SendGrid, il faut configurer la clé API dans les variables d’environnement (exemple : `SENDGRID_API_KEY`).

```js
// Exemple d’utilisation dans le code backend
sendMail({
  to: user.email,
  subject: "Confirmation d'inscription",
  text: " Bonjour ${username} Vous êtes bien inscrit(e) à l'événement (ID : ${event_id}).Statut RSVP : ${status}.Merci pour votre participation !Cordialement,EventHub!"
```

🔧 Suggestions
1.Ajouter des tests unitaires avec Jest
2.Protéger certaines routes avec des rôles (admin/user)
3.Logger les erreurs et les accès
4.Gérer la lecture et suppression des notifications

## 📝 Licence
Ce projet est sous licence MIT.
Le fichier LICENSE contient les termes de la licence, également inclus en haut des fichiers sources.

✍️ Auteures
👤 Nacoulma B.Doris Fallone et Mossamih Khadidia
*Github: [@fallone15](https://github.com/fallone15)

## Show your support

laisse une ⭐️ si le projet t'a ete utile

Copyright © 2025 [Nacoulma Mossamih](https://github.com/fallone15).
This project is [LICENSE](C:\event_hub\front_end\LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_