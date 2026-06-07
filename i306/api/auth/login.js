import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAIL = 'admin@eventandparty.ch';
const ADMIN_PASSWORD = 'admin';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    // Chemin corrigé pour Vercel
    const dataPath = path.join(__dirname, '../../data/users.json');
    const usersRaw = fs.readFileSync(dataPath, 'utf8');
    const users = JSON.parse(usersRaw);
    
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
    
    try {
      fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    } catch (wErr) {
      console.error('Failed to persist user login:', wErr);
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _pw, ...safe } = user;
    res.json({ success: true, user: safe });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la lecture des utilisateurs.' });
  }
}
