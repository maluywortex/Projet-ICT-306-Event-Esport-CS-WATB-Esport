const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));
// Serve public assets if any
app.use('/public', express.static(path.join(__dirname, '../../public')));
app.use('/logo', express.static(path.join(__dirname, '../../logo')));

// ==========================================
// SIMULATED DATABASE STATE
// ==========================================
let teams = [
  { id: 1, name: 'Team BDS', logo: '🛡️', captain: 'Maka', rank: 12 },
  { id: 2, name: 'Team Vitality', logo: '🐝', captain: 'apEX', rank: 3 },
  { id: 3, name: 'G2 Esports', logo: ' samurai ', captain: 'Snax', rank: 4 },
  { id: 4, name: 'Natus Vincere', logo: '⚡', captain: 'Aleksib', rank: 2 }
];

let matches = [
  {
    id: 1,
    teamA: teams[1], // Vitality
    teamB: teams[2], // G2
    time: '23 Mai 2026 - 10:00',
    status: 'completed',
    scoreA: 13,
    scoreB: 9,
    winner: 'Team Vitality',
    stage: 'Demi-finale 1',
    logs: [
      { round: 1, text: 'NaVi wins pistol round', condition: 'elimination' },
      { round: 5, text: 'Vitality wins clean eco round', condition: 'defusal' },
      { round: 22, text: 'apEX closes the map with a triple kill', condition: 'elimination' }
    ]
  },
  {
    id: 2,
    teamA: teams[3], // NaVi
    teamB: teams[0], // BDS
    time: '23 Mai 2026 - 14:00',
    status: 'completed',
    scoreA: 13,
    scoreB: 5,
    winner: 'Natus Vincere',
    stage: 'Demi-finale 2',
    logs: [
      { round: 1, text: 'NaVi wins pistol round', condition: 'elimination' },
      { round: 18, text: 'jL clutches a 1v3 post-plant', condition: 'explosion' }
    ]
  },
  {
    id: 3,
    teamA: teams[2], // G2
    teamB: teams[0], // BDS
    time: '24 Mai 2026 - 10:00',
    status: 'scheduled',
    scoreA: 0,
    scoreB: 0,
    winner: null,
    stage: 'Petite Finale (3e place)',
    logs: []
  },
  {
    id: 4,
    teamA: teams[1], // Vitality
    teamB: teams[3], // NaVi
    time: '24 Mai 2026 - 15:00',
    status: 'live',
    scoreA: 8,
    scoreB: 7,
    winner: null,
    stage: 'Grande Finale 🏆',
    logs: [
      { round: 1, text: 'Vitality wins pistol round on Nuke', condition: 'elimination' },
      { round: 2, text: 'NaVi answers with a force buy win', condition: 'defusal' },
      { round: 5, text: 'ZywOo clutches 1v2 AWP hold', condition: 'elimination' },
      { round: 10, text: 'w0nderful defuses the bomb in smoke', condition: 'defusal' },
      { round: 15, text: 'NaVi completes comeback to tie half 8-7', condition: 'explosion' }
    ]
  }
];

let ticketCategories = [
  {
    id: 1,
    name: 'Pass Samedi',
    description: 'Accès complet pour la journée du samedi 23 mai 2026. Place assise libre, accès aux stands partenaires et animations.',
    price: 35.00,
    total: 450,
    available: 114
  },
  {
    id: 2,
    name: 'Pass Dimanche',
    description: 'Accès complet pour la journée finale du dimanche 24 mai 2026. Cérémonie finale, finale du tournoi et remises de prix.',
    price: 40.00,
    total: 450,
    available: 89
  },
  {
    id: 3,
    name: 'Pass Weekend Gold',
    description: 'Accès 2 jours (23-24 mai). Badge physique collector, poster officiel de l’événement et 1 boisson offerte par jour.',
    price: 65.00,
    total: 200,
    available: 24
  },
  {
    id: 4,
    name: 'Pass VIP Premium',
    description: 'Accès VIP 2 jours. Place VIP en tribune centrale, accès exclusif à la zone Pro/Joueurs, buffet dinatoire, boisson à volonté et t-shirt officiel.',
    price: 150.00,
    total: 50,
    available: 3
  }
];

// Seeded Orders (representing CHF ~93,890.00 already sold to match the financial target)
let orders = [
  {
    id: 'ORD-9842',
    name: 'Jean Dupont',
    email: 'jean.dupont@gmail.com',
    items: [
      { name: 'Pass Weekend Gold', quantity: 2, price: 65.00 }
    ],
    total: 130.00,
    method: 'Twint',
    status: 'Payé',
    date: '2026-05-25T14:32:00.000Z'
  },
  {
    id: 'ORD-9843',
    name: 'Marc Vandeveld',
    email: 'marc.v@bluewin.ch',
    items: [
      { name: 'Pass VIP Premium', quantity: 4, price: 150.00 },
      { name: 'Pass Weekend Gold', quantity: 2, price: 65.00 }
    ],
    total: 730.00,
    method: 'Carte de crédit',
    status: 'Payé',
    date: '2026-05-26T09:15:00.000Z'
  },
  {
    id: 'ORD-9844',
    name: 'Chloé Keller',
    email: 'chloe.keller@heig-vd.ch',
    items: [
      { name: 'Pass Dimanche', quantity: 3, price: 40.00 }
    ],
    total: 120.00,
    method: 'Twint',
    status: 'Payé',
    date: '2026-05-27T08:04:00.000Z'
  }
];

// Helper to calculate total revenue, including standard sponsorship contracts seeded
const SPONSORSHIP_REVENUE = 84200.00; // CHF from main sponsors (Logitech G, Republic of Gamers, Yverdon Ville, etc.)

function getFinancials() {
  const ticketRevenue = ticketCategories.reduce((acc, cat) => {
    const sold = cat.total - cat.available;
    return acc + (sold * cat.price);
  }, 0);

  const totalRevenue = ticketRevenue + SPONSORSHIP_REVENUE;
  return {
    ticketsSold: ticketCategories.reduce((acc, cat) => acc + (cat.total - cat.available), 0),
    totalTickets: ticketCategories.reduce((acc, cat) => acc + cat.total, 0),
    ticketRevenue: ticketRevenue,
    sponsorships: SPONSORSHIP_REVENUE,
    totalRevenue: totalRevenue,
    targetMin: 90000.00,
    targetMax: 110000.00
  };
}

// 2FA Admin Setup
const ADMIN_EMAIL = 'admin@eventandparty.ch';
const ADMIN_PASSWORD = 'admin'; // simple demo credentials
let active2FACodes = {}; // store active verification codes

// ==========================================
// API ENDPOINTS
// ==========================================

// Get tournament data
app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.get('/api/matches', (req, res) => {
  res.json(matches);
});

// Update live match details (Admin)
app.post('/api/matches/:id', (req, res) => {
  const matchId = parseInt(req.params.id);
  const { scoreA, scoreB, status, winner, logText, logCondition } = req.body;
  const match = matches.find(m => m.id === matchId);

  if (!match) {
    return res.status(404).json({ error: 'Match non trouvé' });
  }

  if (scoreA !== undefined) match.scoreA = parseInt(scoreA);
  if (scoreB !== undefined) match.scoreB = parseInt(scoreB);
  if (status !== undefined) match.status = status;
  if (winner !== undefined) match.winner = winner;

  if (logText) {
    const roundNum = match.scoreA + match.scoreB;
    match.logs.push({
      round: roundNum,
      text: logText,
      condition: logCondition || 'elimination'
    });
  }

  res.json({ success: true, match });
});

// Get ticket list
app.get('/api/tickets', (req, res) => {
  res.json(ticketCategories);
});

// Purchase tickets
app.post('/api/tickets/purchase', (req, res) => {
  const { name, email, paymentMethod, items, cardBrand, cardNumberMasked } = req.body;

  if (!name || !email || !paymentMethod || !items || !items.length) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  // Server-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'adresse e-mail invalide.' });
  }

  // Server-side name validation
  if (typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Le nom complet doit comporter au moins 2 caractères.' });
  }

  // Server-side payment card validation
  if (paymentMethod === 'Carte de Crédit') {
    if (!cardBrand || !cardNumberMasked) {
      return res.status(400).json({ error: 'Informations de carte bancaire manquantes ou incomplètes.' });
    }
    const validBrands = ['VISA', 'MASTERCARD', 'AMEX'];
    if (!validBrands.includes(cardBrand)) {
      return res.status(400).json({ error: 'Réseau de carte bancaire non supporté.' });
    }
    if (!/^\*\*\*\* \*\*\*\* \*\*\*\* \d{4}$/.test(cardNumberMasked)) {
      return res.status(400).json({ error: 'Format du numéro de carte masqué invalide.' });
    }
  }

  // Verify and update quantities
  let totalCost = 0;
  const purchasedItems = [];

  for (const item of items) {
    // Validate quantities strictly
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ error: 'La quantité de billets doit être un entier positif.' });
    }

    const category = ticketCategories.find(c => c.id === item.categoryId);
    if (!category) {
      return res.status(404).json({ error: `Catégorie de billet ID ${item.categoryId} inexistante.` });
    }
    if (category.available < item.quantity) {
      return res.status(400).json({ error: `Quantité insuffisante pour ${category.name}. Reste: ${category.available}` });
    }
    category.available -= item.quantity;
    totalCost += category.price * item.quantity;
    purchasedItems.push({
      name: category.name,
      quantity: item.quantity,
      price: category.price
    });
  }

  // Format payment method with card details for the admin portal display
  let displayMethod = paymentMethod;
  if (paymentMethod === 'Carte de Crédit') {
    displayMethod = `Carte (${cardBrand.charAt(0) + cardBrand.slice(1).toLowerCase()}) ${cardNumberMasked}`;
  }

  // Create order
  const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    id: orderId,
    name: name.trim(),
    email: email.trim(),
    items: purchasedItems,
    total: totalCost,
    method: displayMethod,
    status: 'Payé',
    date: new Date().toISOString()
  };

  orders.unshift(newOrder); // Add to beginning

  res.json({
    success: true,
    order: newOrder,
    message: 'Billets achetés avec succès ! Un e-mail de confirmation avec QR code a été simulé.'
  });
});

// Get orders list (Admin only)
app.get('/api/admin/orders', (req, res) => {
  res.json(orders);
});

// Get admin financial stats
app.get('/api/admin/financials', (req, res) => {
  res.json(getFinancials());
});

// Admin Product Management
app.put('/api/admin/tickets/:id', (req, res) => {
  const catId = parseInt(req.params.id);
  const { name, description, price, total, available } = req.body;
  const cat = ticketCategories.find(c => c.id === catId);

  if (!cat) {
    return res.status(404).json({ error: 'Catégorie non trouvée' });
  }

  if (name !== undefined) cat.name = name;
  if (description !== undefined) cat.description = description;
  if (price !== undefined) cat.price = parseFloat(price);
  if (total !== undefined) cat.total = parseInt(total);
  if (available !== undefined) cat.available = parseInt(available);

  res.json({ success: true, ticket: cat });
});

// Authenticate Admin & generate 2FA Code
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Generate a 6-digit random code for 2FA simulation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    active2FACodes[email] = {
      code,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };

    console.log(`[2FA SECURITY SIMULATED] Code pour ${email} : ${code}`);

    res.json({
      success: true,
      requires2FA: true,
      message: 'Code de sécurité généré. Entrez le code affiché par le simulateur.',
      // For demo convenience, we also supply it in the body so the client can display/autofill
      demoCode: code
    });
  } else {
    res.status(401).json({ error: 'Identifiants invalides.' });
  }
});

// Simple user login (email/password) - demo using JSON file
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

  // Read users from JSON (demo simple storage)
  try {
    const dataPath = path.join(__dirname, '../../data/users.json');
    const usersRaw = fs.readFileSync(dataPath, 'utf8');
    const users = JSON.parse(usersRaw);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé.' });

    // For demo purposes passwords stored in plain text (NOT for production)
    if (user.password !== password) return res.status(401).json({ error: 'Mot de passe incorrect.' });

    // Update login metadata and persist
    user.last_login = new Date().toISOString();
    user.login_count = (user.login_count || 0) + 1;
    try {
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    } catch (wErr) {
      console.error('Failed to persist user login:', wErr);
    }

    // Return user info without password
    const { password: _pw, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la lecture des utilisateurs.' });
  }
});

// Register new user (demo storage in data/users.json)
app.post('/api/users/register', (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis.' });

  const dataPath = path.join(__dirname, '../../data/users.json');
  try {
    const usersRaw = fs.readFileSync(dataPath, 'utf8');
    const users = JSON.parse(usersRaw);

    const emailLower = email.toLowerCase();
    if (users.find(u => u.email.toLowerCase() === emailLower)) {
      return res.status(409).json({ error: 'Un compte avec cette adresse e-mail existe déjà.' });
    }

    const newUser = {
      id: 'user-' + Date.now(),
      email: emailLower,
      password: password, // plain text for demo only
      first_name: first_name,
      last_name: last_name,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      login_count: 1,
      role: 'spectator'
    };

    users.push(newUser);
    try {
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    } catch (wErr) {
      console.error('Failed to write new user:', wErr);
    }

    const { password: _pw, ...safe } = newUser;
    res.status(201).json({ success: true, user: safe });
  } catch (err) {
    console.error('User register error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});

// Verify 2FA
app.post('/api/auth/verify-2fa', (req, res) => {
  const { email, code } = req.body;
  const record = active2FACodes[email];

  if (record && record.code === code && Date.now() < record.expires) {
    delete active2FACodes[email]; // Consume code
    res.json({
      success: true,
      token: 'mock-jwt-token-event-cs-2026',
      user: {
        email,
        name: 'Administrateur EventAndParty',
        role: 'admin'
      }
    });
  } else {
    res.status(400).json({ error: 'Code 2FA incorrect ou expiré.' });
  }
});

// ==========================================
// BACKGROUND SIMULATION: LIVE MATCH TICKER
// ==========================================
// To make the website feel responsive and "alive" as requested by guidelines,
// let's simulate rounds for the Grand Final (Match ID 4) every 20 seconds.
setInterval(() => {
  const grandFinal = matches.find(m => m.id === 4);
  if (grandFinal && grandFinal.status === 'live') {
    const isScoreA = Math.random() > 0.48; // slightly favor Team A (Vitality)
    
    if (isScoreA) {
      grandFinal.scoreA++;
    } else {
      grandFinal.scoreB++;
    }

    const roundNum = grandFinal.scoreA + grandFinal.scoreB;
    const actions = [
      'ZywOo réalise un headshot incroyable à travers la fumée',
      'Aleksib réussit à poser le Spike juste à temps et NaVi tient le site A',
      'apEX mène un assaut agressif sur le site B',
      'Spinx sauve le round avec un double kill décisif au Deagle',
      'jL remporte un duel tendu au couteau pour la foule !',
      'NaVi désamorce le C4 à 0.05 seconde près !',
      'iM élimine trois joueurs en éco round avec une MAG-7'
    ];
    const conditions = ['elimination', 'defusal', 'explosion'];

    const chosenAction = actions[Math.floor(Math.random() * actions.length)];
    const chosenCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const winningTeamName = isScoreA ? 'Team Vitality' : 'Natus Vincere';

    grandFinal.logs.unshift({
      round: roundNum,
      text: `${winningTeamName} remporte le round ${roundNum} : ${chosenAction}.`,
      condition: chosenCondition
    });

    // Limit logs length
    if (grandFinal.logs.length > 10) {
      grandFinal.logs.pop();
    }

    // Check match completion
    if (grandFinal.scoreA >= 13 && grandFinal.scoreA - grandFinal.scoreB >= 2) {
      grandFinal.status = 'completed';
      grandFinal.winner = 'Team Vitality';
      grandFinal.logs.unshift({
        round: roundNum,
        text: '🏆 Team Vitality remporte la Grande Finale de l\'Event CS 2026 ! 🏆',
        condition: 'elimination'
      });
    } else if (grandFinal.scoreB >= 13 && grandFinal.scoreB - grandFinal.scoreA >= 2) {
      grandFinal.status = 'completed';
      grandFinal.winner = 'Natus Vincere';
      grandFinal.logs.unshift({
        round: roundNum,
        text: '🏆 Natus Vincere remporte la Grande Finale de l\'Event CS 2026 ! 🏆',
        condition: 'elimination'
      });
    }

    console.log(`[LIVE MATCH SIMULATION] Match 4 mis à jour: Vitality ${grandFinal.scoreA} - ${grandFinal.scoreB} NaVi`);
  }
}, 20000);

// Root fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎮 Event CS 2026 Server running on http://localhost:${PORT}`);
  console.log(`🟣 Color Theme: Sleek Purple / Esports Neon Violet`);
  console.log(`📍 Location: La Marive, Yverdon-les-Bains`);
  console.log(`📅 Dates: 23-24 May 2026`);
  console.log(`====================================================`);
});
