// Base de données en mémoire (partagée entre les appels)
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

  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      first_name,
      last_name,
      created_at: new Date().toISOString(),
      last_login: null,
      login_count: 0
    };

    users.push(newUser);

    const { password: _pw, ...safe } = newUser;
    return res.status(201).json({ success: true, user: safe });
  } catch (err) {
    console.error('User register error:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
};
