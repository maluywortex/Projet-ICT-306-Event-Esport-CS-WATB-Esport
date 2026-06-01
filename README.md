# Projet-ICT-306-Event-Esport-CS-WATB-Esport
Projet ICT-306 , Event Esport CS WATB Esport . Ce projet est une evenemnt Esport sur le jeu-video Counter Strike. Nous devons organiser l'evenment de A à Z

---

## Table de matière
- [1. Introduction](#1-introduction)
- [2. Objectifs](#2-objectifs)
- [3. Description du projet](#3-description-du-projet)
- [4. Architecture global](#4-architecture-global)
- [5. Organisation du dépôt](#5-organisation-du-dépôt)
- [6. Prérequis](#6-prérequis)
  - [6.1 Logiciels et language de code](#6.1-logiciels-language-de-code)
  - [6.2 Navigateurs](#6.2-navigateurs)
- [7. Planning prévisionnel](#7-planning-prévisionnel)
- [8. Livrables attendus](#8-livrables-attendus)
  - [8.1 Livrables techniques](#8.1-livrables-techniques)
  - [8.2 Livrables organisationnels et documentaires](#8.2-livrables-organisationnels-et-documentaires)
- [9. Conclusion](#9-conclusion)

  ---

  ## 1. Introduction

 Event CS — Tournoi Counter-Strike 2026

Ce projet consiste en l’organisation complète d’un tournoi Esport Counter-Strike à Yverdon-les-Bains, organisé par EventAndParty les 23 et 24 mai 2026.
L’événement réunira environ 500 spectateurs par jour ainsi que plusieurs équipes compétitives dans un environnement dédié au gaming et à la compétition Esport.

Le projet comprend la gestion du tournoi, la logistique, la sécurité, l’hébergement des équipes, la communication ainsi que le développement d’une plateforme web permettant aux spectateurs de consulter les informations de l’événement, acheter leurs billets et suivre les résultats en direct.

Ce dépôt GitHub regroupe l’ensemble des ressources liées au projet : développement du site web, organisation technique, documentation, gestion des tâches et suivi du projet via une méthodologie Agile/Kanban.



  ## 2. Objectifs

  Organiser un tournoi Esport accueillant environ 500 spectateurs/jour sur deux jours.
Offrir des conditions optimales de confort, sécurité et performance pour les joueurs, spectateurs et partenaires
Développer un site web fonctionnel permettant l'inscription, l'achat de billets et le suivi des résultats en direct
Assurer la coordination complète des prestataires (salle, hébergement, sécurité, restauration, matériel)
Atteindre un objectif financier de CHF 90'000 – 110'000 grâce aux sponsors, à la billetterie et aux ventes diverses

  ## 3. Description du projet

  Périmètre
Le projet se déroule à Yverdon-les-Bains (La Marive). La billetterie est disponible dans toute la Suisse.
Organisation de l'événement — 5 domaines

  - Lieu — Zone spectateurs (500 pers./jour) + espaces réservés aux 4 équipes
  - Hébergement — Hôtel et restauration pour les 4 équipes participantes (budget CHF 50/pers./jour)
  - Sécurité — Sécurité physique sur site (Securitas SA) + sécurité du site web
  - Logistique — Accueil, navettes, salles de jeu, matériel gaming (PC, écrans, périphériques)
  - Communication — Instagram, TikTok, X, flyers, vidéos promotionnelles, site web d'inscription

Site web — Fonctionnalités
Front-office (public)

Consulter les informations du tournoi (lieu, dates, équipes)
Consulter le programme des matchs
S'inscrire en tant que spectateur et payer son billet en ligne
Recevoir une confirmation par e-mail avec le billet
Suivre les résultats en direct

Back-office (administrateurs)

Authentification sécurisée avec double authentification (2FA)
Gestion du contenu, des équipes et des inscriptions
Mise à jour du programme des matchs et des résultats en direct
Envoi de mailings aux spectateurs inscrits

  ## 4. Architecture global
```
  Event CS
├── Site Web
│   ├── Front-office (visiteurs / spectateurs)
│   │   ├── Connexion & 2FA
│   │   ├── Catalogue / billetterie
│   │   ├── Panier & paiement
│   │   └── Résultats en direct
│   └── Back-office (administrateurs)
│       ├── Gestion des produits
│       ├── Gestion des commandes
│       └── Gestion des équipes & résultats
├── Organisation événementielle
│   ├── Logistique (salle, matériel, transport)
│   ├── Hébergement & restauration
│   ├── Sécurité
│   └── Communication & marketing
└── Gestion de projet
    └── Kanban GitHub (Issues, Projects)
```
  ## 5. Organisation du dépôt
```
  
├── src/                  # Code source du site web
│   ├── frontend/         # HTML, CSS, JS (front-office)
│   ├── backend/          # Node.js / Express.js
│   └── database/         # Scripts SQL (schéma, seed)
├── docs/                 # Documentation du projet
│   ├── cahier_des_charges.docx
│   └── maquettes/        # Maquettes graphiques (UI)
├── public/               # Assets statiques (images, logos)
└── README.md
```
  ## 6. Prérequis
  ### 6.1 Logiciel et language de code
  - Vs code
  - HTML
  - CSS
  - Javascript
  - Node.js et Express.js
  - MySQL     

  
  ### 6.2 Navigateur

 - Google Chrome
 - Mozilla Firefox
 - Safari
 - Microsoft Edge
 - Mobile : Chrome Android, Safari iOS

  ## 7. Planning prévisionnel

- Semaine 1        Choix du sujet
- Semaine 2        1er Entretien (formatif) pour définir les besoins du client
- Semaine 3        Restitution de l’appel d’offre
- Semaine 4        2ème Entretien client pour validation de l’appel d’offre
- Semaine 5        Rédaction du CDC
- Semaine 6        3ème entretien client pour validation du CDC
- Semaine 7        Réalisation
- Semaine 8        Réalisation

  ## 8. Livrables attendus
  ### 8.1 Livravles techniques
- Site web fonctionnel (front-office + back-office)
- Système d'inscription et de paiement en ligne
- Module de résultats en direct
- Authentification sécurisée avec 2FA
- Base de données MySQL opérationnelle
- Documentation technique (installation, déploiement)
  ### 8.2 Livrable organisationnels et documentaires
 - Cahier des charges complet
 - Maquettes graphiques validées
 - Backlog et tableau Kanban mis à jour
 - Plan de communication (réseaux sociaux, flyers)
 - Coordination des prestataires (salle La Marive, Securitas SA, hôtel, traiteur)
 - Formation à la gestion du back-office pour le store manager

  ## 9. Conclusion
  
  Ce projet a été une bonne expérience pour notre équipe. On a dû gérer à la fois le développement du site et toute l'organisation de l'événement, ce qui n'était pas toujours simple à concilier.     GitHub nous a aidé à rester organisés et à avancer ensemble malgré les contraintes de temps.

  
