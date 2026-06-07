// Base de données en mémoire
let users = [
  {
    id: 'user-1',
    email: 'jean.dupont@gmail.com',
    password: 'changeme',
    first_name: 'Jean',
    last_name: 'Dupont',
    created_at: '2026-05-25T14:32:00.000Z',
    last_login: null,
    login_count: 0
  },
  {
    id: 'user-2',
    email: 'marc.v@bluewin.ch',
    password: 'changeme',
    first_name: 'Marc',
    last_name: 'Vandeveld',
    created_at: '2026-05-26T09:15:00.000Z',
    last_login: null,
    login_count: 0
  },
  {
    id: 'user-3',
    email: 'chloe.keller@heig-vd.ch',
    password: 'changeme',
    first_name: 'Chloé',
    last_name: 'Keller',
    created_at: '2026-05-27T08:04:00.000Z',
    last_login: null,
    login_count: 0
  },
  {
    id: 'admin-1',
    email: 'admin@eventandparty.ch',
    password: 'admin',
    first_name: 'Admin',
    last_name: 'Event',
    created_at: '2026-05-01T09:00:00.000Z',
    last_login: null,
    login_count: 0,
    role: 'admin'
  }
];

module.exports = (req, res) => {
  // Activer CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Mettre à jour les métadonnées
    user.last_login = new Date().toISOString();
    user.login_count = (user.login_count || 0) + 1;

    // Retourner l'utilisateur sans le mot de passe
    const { password: _pw, ...safe } = user;
    return res.status(200).json({ success: true, user: safe });
  } catch (err) {
    console.error('User login error:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};
