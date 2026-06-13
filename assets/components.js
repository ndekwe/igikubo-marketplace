/* =========================================================
   Composants partagés — Igikubo Marketplace
   Header, Footer et carte-disque réutilisables.
   Injectés côté client pour éviter la duplication entre pages.
   ========================================================= */

const NAV_ITEMS = [
  { label: 'Catalogue', href: 'catalogue.html', key: 'catalogue' },
  { label: 'Devenir créateur', href: 'devenir-createur.html', key: 'createur' },
  { label: 'Comment ça marche', href: 'devenir-createur.html#etapes', key: 'how' }
];

/* ---- Helpers visuels ---- */

// Disque signature : 8 secteurs alternés + moyeu blanc + emblème octogonal.
function discVisual(color, light, icon) {
  const wedge = `conic-gradient(from -22.5deg, ${color} 0 45deg, ${light} 45deg 90deg, ${color} 90deg 135deg, ${light} 135deg 180deg, ${color} 180deg 225deg, ${light} 225deg 270deg, ${color} 270deg 315deg, ${light} 315deg 360deg)`;
  return `
    <div class="disc" style="background:${wedge}; box-shadow:inset 0 0 0 7px rgba(255,255,255,.6), inset 0 0 0 9px ${color}, 0 14px 26px ${color}55;">
      <div class="disc__hub">
        <div class="disc__emblem" style="background:${light};"><span style="color:${color};">${icon}</span></div>
      </div>
    </div>`;
}

function starString(rating) {
  const filled = Math.round(Number(rating) || 0);
  let s = '';
  for (let i = 0; i < 5; i++) s += i < filled ? '★' : '☆';
  return s;
}

function formatPrice(p) {
  return (Number(p) || 0).toFixed(2).replace('.', ',') + ' €';
}

function ratingLabel(r) {
  return r ? Number(r).toFixed(1).replace('.', ',') : '—';
}

// Carte-disque réutilisable (accueil, catalogue, suggestions).
function discCard(d) {
  const color = d.color || '#ff9e7d';
  const light = d.colorLight || '#ffded2';
  const icon = d.icon || '◆';
  const creator = d.creator || 'Créateur';
  const initial = creator.trim().charAt(0).toUpperCase();
  return `
    <a class="disc-card" href="disque.html">
      <div class="disc-card__media">
        <span class="badge-theme" style="background:${light};">${d.theme}</span>
        <div class="disc-card__disc">${discVisual(color, light, icon)}</div>
      </div>
      <div class="disc-card__body">
        <h3>${d.title}</h3>
        <div class="disc-card__creator">
          <span class="avatar avatar--sm" style="background:${color};">${initial}</span>
          <b>par ${creator}</b>
        </div>
        <div class="disc-card__rating">
          <span class="stars">${starString(d.rating)}</span>
          <span class="rating-num">${ratingLabel(d.rating)}</span>
          <span class="reviews">(${d.reviews || 0})</span>
        </div>
      </div>
      <div class="disc-card__foot">
        <span class="price">${formatPrice(d.price)}</span>
        <span class="see">Voir →</span>
      </div>
    </a>`;
}

/* ---- Header ---- */
function headerHTML(active) {
  const links = NAV_ITEMS.map(it => `
    <a class="nav__link" href="${it.href}">
      <span>${it.label}</span>
      ${it.key === active ? '<i></i>' : ''}
    </a>`).join('');
  return `
  <div class="topbar">
    <div class="topbar__inner">
      <span class="topbar__tag"><span>✦</span> Éveiller le Bonheur par les Jeux</span>
      <div class="topbar__links">
        <a href="devenir-createur.html">Comment ça marche</a>
        <a href="#">Aide</a>
        <a href="#">FR · €</a>
      </div>
    </div>
  </div>
  <div class="navbar">
    <div class="navbar__inner">
      <a class="brand" href="index.html">
        <span class="octa-logo"><span></span></span>
        <span style="display:flex; flex-direction:column; line-height:1;">
          <span class="brand__name">Igikubo</span>
          <span class="brand__sub">Marketplace</span>
        </span>
      </a>
      <label class="search">
        <span>⌕</span>
        <input type="text" placeholder="Rechercher un disque, un thème, un créateur…">
      </label>
      <nav class="nav">
        ${links}
        <a class="nav__signin" href="connexion.html">Connexion</a>
        <a class="btn btn-primary btn-md" href="connexion.html#inscription">S'inscrire</a>
        <a class="cart" href="catalogue.html" aria-label="Panier">
          <span class="cart__bag"></span>
          <span class="cart__count">2</span>
        </a>
      </nav>
    </div>
  </div>`;
}

/* ---- Footer ---- */
function footerHTML() {
  return `
  <div class="site-footer__inner">
    <div class="site-footer__top">
      <div class="foot-brand">
        <span style="display:inline-flex; align-items:center; gap:12px;">
          <span class="foot-octa"><span></span></span>
          <span class="foot-brand__name">Igikubo Marketplace</span>
        </span>
        <p>Des centaines de jeux pour un seul plateau octogonal. Une place de marché qui réunit créateurs et joueurs, pour éveiller le bonheur par les jeux.</p>
        <div class="socials">
          <a href="#" aria-label="Instagram">IG</a>
          <a href="#" aria-label="Facebook">FB</a>
          <a href="#" aria-label="YouTube">YT</a>
          <a href="#" aria-label="TikTok">TT</a>
        </div>
      </div>
      <div class="foot-cols">
        <div class="foot-col">
          <span>Marketplace</span>
          <a href="catalogue.html">Catalogue</a>
          <a href="catalogue.html">Nouveautés</a>
          <a href="index.html#themes">Explorer par thème</a>
          <a href="catalogue.html">Meilleures ventes</a>
        </div>
        <div class="foot-col">
          <span>Créateurs</span>
          <a href="devenir-createur.html">Devenir créateur</a>
          <a href="devenir-createur.html#etapes">Comment publier</a>
          <a href="devenir-createur.html#faq">FAQ créateurs</a>
          <a href="devenir-createur.html">Tarifs &amp; revenus</a>
        </div>
        <div class="foot-col">
          <span>Igikubo</span>
          <a href="#">Le plateau octogonal</a>
          <a href="#">Notre histoire</a>
          <a href="#">Le journal</a>
          <a href="#">Nous contacter</a>
        </div>
      </div>
      <div class="foot-news">
        <span>La lettre joyeuse</span>
        <p>Nouveaux disques, créateurs à suivre et idées de jeux, une fois par mois.</p>
        <form onsubmit="return false;">
          <input type="email" placeholder="Votre e-mail">
          <button type="submit">Je m'abonne</button>
        </form>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>© 2026 Igikubo Marketplace · Conçu avec joie 😺 par la communauté.</span>
      <div class="site-footer__legal">
        <a href="#">Mentions légales</a>
        <a href="#">CGV</a>
        <a href="#">Confidentialité</a>
      </div>
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = headerHTML(header.dataset.active || '');
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = footerHTML();
  }
});
