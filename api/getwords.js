export default function handler(req, res) {
  // Ton dictionnaire complet ici (remplace par ta vraie liste !)
  const words = [
    "nique", "niquer", "banane", "salade", "bizarre", "syllabe", "bombe", "partie",
    // Ajoute tous tes mots ici !
  ];

  // Récupère la syllabe envoyée par le front
  const syllabe = req.query.syllabe;
  if (!syllabe) return res.status(400).json({ error: "Syllabe requise" });

  // Filtre les mots qui contiennent la syllabe (case insensitive)
  const query = syllabe.toLowerCase();
  const mots = words.filter(w => w.toLowerCase().includes(query));

  // Renvoie la réponse JSON au front
  res.status(200).json({ mots });
}
