// --- Fonctions utilitaires ---

// Affiche un lien vers la page login si utilisateur non connecté
// (fonction ajoutée pour éviter l'erreur showLoginLink undefined)
function showLoginLink() {
  console.log('showLoginLink appelée');
  // Ici on peux afficher un bouton ou un lien login dans ton UI
  // Par exemple, rendre visible un élément caché `#login-link`
  const loginLink = document.getElementById('login-link');
  if (loginLink) loginLink.style.display = 'block';
}

// Applique un filtre de prix aux places (exemple, adapte selon besoins réels)
function applyPriceFilter() {
  console.log('applyPriceFilter appelée');
  // Implementation du filtre (à adapter)
}

//Fonction de chargement des places (exemple)
async function loadPlaces() {
  const placesContainer = document.getElementById('places-container');
  if (!placesContainer) {
    console.error('Element #places-container not found in DOM!');
    return;
  }
  // Exemple fetch des places depuis API
  console.log('Chargement des places ...');
  // Ta logique ici ...
}

// Vérifie le statut de connexion utilisateur via le token JWT
async function checkLoginStatus() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('Pas de token trouvé, utilisateur non connecté');
      showLoginLink();
      return;
    }

    const response = await fetch('/api/v1/auth/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      console.log('Token expiré ou non valide, déconnexion');
      localStorage.removeItem('access_token');
      showLoginLink();
    } else if (response.ok) {
      const data = await response.json();
      console.log('Statut login:', data);
      // ici tu peux gérer l'affichage d'éléments pour utilisateur connecté
      // ex : masquer lien login, afficher profil, etc.
    } else {
      console.error('Erreur inattendue lors du checkLoginStatus:', response.status);
      showLoginLink();
    }
  } catch (error) {
    console.error('Erreur vérification statut login:', error);
    showLoginLink();
  }
}

// Fonction appelant loadPlaces après login réussi
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      console.error('Erreur login:', response.status);
      return;
    }
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    console.log('Login réussi');
    await loadPlaces();
  } catch (error) {
    console.error('Erreur lors du login:', error);
  }
}

// --- Code d'initialisation et écouteurs d'événements --- 

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');

  // Setup du filtre prix
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('change', applyPriceFilter);
  } else {
    console.warn('Element #price-filter not found in DOM!');
  }

  // Vérifie le status de connexion utilisateur au chargement
  checkLoginStatus();

  // S’assure que loadPlaces ne s’exécute que sur les pages possédant #places-container
  const placesContainer = document.getElementById('places-container');
  if (placesContainer) {
    loadPlaces();
  } else {
    console.warn('Element #places-container not found in DOM!');
  }

  // Exemple : écouteur sur formulaire login (adapter si tu as un formulaire login)
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await loginUser(email, password);
      // Après login, tu peux éventuellement rediriger vers index.html
      window.location.href = '/templates/index.html';
    });
  }
});
