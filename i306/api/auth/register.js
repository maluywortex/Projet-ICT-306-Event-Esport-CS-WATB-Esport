import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    const dataPath = path.join(__dirname, '../../data/users.json');
    const usersRaw = fs.readFileSync(dataPath, 'utf8');
    const users = JSON.parse(usersRaw);

    // Vérifier si l'utilisateur existe déjà
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // À HASHER en production!
      first_name,
      last_name,
      created_at: new Date().toISOString(),
      last_login: null,
      login_count: 0
    };

    users.push(newUser);
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

    const { password: _pw, ...safe } = newUser;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('User register error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
}
