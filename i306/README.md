# Event CS — Tournoi Counter-Strike 2026 🎮🟣

Bienvenue sur le dépôt officiel du projet **Event CS 2026**, une plateforme web immersive et performante pour la gestion et le suivi en direct du tournoi d'Esport Counter-Strike 2 organisé par **EventAndParty** à Yverdon-les-Bains.

L'événement se déroulera les **23 et 24 mai 2026** au complexe de **La Marive** et réunira environ 500 spectateurs par jour ainsi que 4 équipes d'élite dans un environnement compétitif professionnel.

---

## 🚀 Fonctionnalités Majeures

### 1. Front-Office (Expérience Spectateurs)
* **Design Gaming Premium** : Interface sombre moderne aux teintes violettes et néons, animations fluides et affichage de style cyberpunk.
* **Billetterie & Panier** : Sélection interactive de billets (Pass Simple, Gold, VIP Premium), gestion des quantités dans le panier et indicateurs de stocks restants en temps réel.
* **Paiement Simulé (TWINT / Carte)** : Système d'encaissement fictif complet avec simulation de QR Code TWINT et formulaire bancaire, émettant un reçu officiel avec QR Code unique à imprimer.
* **Brackets & Live Ticker** : Visualisation du calendrier du tournoi et suivi en direct de la Grande Finale (Vitality vs NaVi) dont les scores et les événements de manches (kills, defuses, explosions) se mettent à jour automatiquement via des requêtes périodiques au serveur.

### 2. Back-Office (Espace Administrateurs Sécurisé)
* **Double Authentification (2FA)** : Connexion sécurisée requérant un code d'authentification jetable à 6 chiffres émis par le serveur.
* **Suivi de la Cible Financière** : Jauge de progression interactive comparant le chiffre d'affaires cumulé (Billetterie + Sponsoring) par rapport à l'objectif financier de **CHF 90'000.00 – 110'000.00**.
* **Rapport des Ventes** : Liste exhaustive des commandes passées avec recherche, moyen de paiement et statuts.
* **Gestion de l'Inventaire** : Modification dynamique des prix, descriptions et allocations de places pour les billets.
* **Console d'Arbitrage des Matchs** : Modification manuelle des scores, des statuts de jeu (Planifié, En Direct, Terminé) et possibilité d'ajouter des round logs personnalisés injectés directement dans le flux des spectateurs.

---

## 📁 Architecture du Projet

Le projet respecte scrupuleusement la structure de dossiers suivante :

```
  Event CS
├── docs/                       # Documentation du projet
│   └── cahier_des_charges.md   # Cahier des charges au format Markdown
├── logo/                       # Logos et images du projet
├── maquette/                   # Maquettes graphiques (UI)
├── node_modules/               # Dépendances et modules de l'application (généré automatiquement)
├── src/                        # Code source du site web
│   ├── backend/                # Partie Serveur (Node.js / Express.js)
│   ├── database/               # Scripts SQL (Base de données MySQL)
│   └── frontend/               # Interface utilisateur (front-office)
├── package.json                # Dépendances Node.js et scripts de lancement
└── README.md                   # Guide d'installation technique et User Stories (Localhost)
```

---

## 🔌 Lancement Rapide (Localhost)

Pour lancer le site web complet et son serveur Node.js sur votre machine de développement :

### Prérequis
* Avoir installé **Node.js** (version 16 ou supérieure recommandée).

### Étapes d'installation et de démarrage
1. Ouvrez un terminal dans la racine de ce dossier.
2. Installez les dépendances nécessaires (Express) :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm start
   ```
4. Ouvrez votre navigateur internet et accédez à l'adresse suivante :
   [**http://localhost:3000**](http://localhost:3000)

> [!TIP]
> **Identifiants de connexion d'administration (Portail Admin) :**
> * **Email** : `admin@eventandparty.ch`
> * **Mot de passe** : `admin`
> * *Le code 2FA requis s'affichera directement dans l'interface de sécurité de démo pour faciliter vos tests !*

---

## 🛠️ Suivi du Projet & Méthodologie Agile

Ce projet a été conçu selon les principes de la méthodologie **Agile/Kanban** en structurant le travail sous forme d'User Stories :
* **US01 - Achat de billets** : Permettre aux spectateurs de choisir un pass et de payer en ligne de manière intuitive.
* **US02 - Brackets interactifs** : Offrir aux visiteurs une vue claire des demi-finales et de la finale avec score mis à jour.
* **US03 - Authentification 2FA** : Sécuriser les droits d'administration pour éviter la triche sur les scores.
* **US04 - Console Administrateur** : Permettre au comité d'organisation d'ajuster les prix et de piloter les scores du tournoi en direct depuis La Marive.
* **US05 - Pilotage Budgétaire** : Garantir la viabilité financière en comparant les rentrées en temps réel face à l'objectif de CHF 90K+.
