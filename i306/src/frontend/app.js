const ticketCatalog = {
    silver: {
        id: 'silver',
        name: 'Silver Pass',
        description: 'Accès journée standard — idéal pour les spectateurs occasionnels.',
    },
    gold: {
        id: 'gold',
        name: 'Gold Pass',
        description: 'Meilleure visibilité et accès prioritaire aux zones communautaires.',
    },
    vip: {
        id: 'vip',
        name: 'VIP — Places Premium',
        description: 'Accès premium, loges, sièges privilégiés et package exclusif.',
    }
};

const cartState = [];

const teams = [
    'Neon Valkyries',
    'Phantom Pulse',
    'Axis Reaper',
    'Shadow Surge',
    'Rift Breakers',
    'Quantum Drift',
    'Iron Sentinels',
    'Nova Strike',
    'Apex Legion',
    'Vortex Wraiths',
    'Crystal Wardens',
    'Spectral Riot',
    'Cyber Wolves',
    'Void Rangers',
    'Titan Flux',
    'Ember Havoc'
];

const matchStages = [
    'Phase de Groupe',
    'Round Rapide',
    'Quart de Finale',
    'Demi-Finale',
    'Match de Placement',
    'Grande Finale'
];

let tournamentMatches = [];
let selectedMatchId = null;

const selectors = {
    cartToggle: document.getElementById('cart-toggle-btn'),
    cartDrawer: document.getElementById('cart-drawer'),
    closeCart: document.getElementById('close-cart-btn'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    cartBadgeCount: document.getElementById('cart-badge-count'),
    cartTotalPrice: document.getElementById('cart-total-price'),
    checkoutBtn: document.getElementById('checkout-btn'),
    checkoutModal: document.getElementById('checkout-modal'),
    closeCheckoutModal: document.getElementById('close-checkout-modal'),
    finishCheckoutBtn: document.getElementById('finish-checkout-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    matchesList: document.getElementById('matches-list-container'),
    matchDetailViewer: document.getElementById('match-detail-viewer'),
    loginBtn: document.getElementById('login-btn'),
    loginModal: document.getElementById('login-modal'),
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginClose: document.getElementById('login-close-btn'),
    loginCancel: document.getElementById('login-cancel'),
    loginError: document.getElementById('login-error'),
    showSignup: document.getElementById('show-signup'),
    signupForm: document.getElementById('signup-form'),
    signupFirst: document.getElementById('signup-first'),
    signupLast: document.getElementById('signup-last'),
    signupEmail: document.getElementById('signup-email'),
    signupPassword: document.getElementById('signup-password'),
    signupCancel: document.getElementById('signup-cancel'),
    signupSubmit: document.getElementById('signup-submit'),
    showLogin: document.getElementById('show-login'),
    signupError: document.getElementById('signup-error'),
    signupSuccess: document.getElementById('signup-success'),
};

const sectionLinks = Array.from(selectors.navLinks).map((link) => {
    const target = document.querySelector(link.getAttribute('href'));
    return target ? { link, target } : null;
}).filter(Boolean);

function setActiveNavLink(activeLink) {
    selectors.navLinks.forEach((link) => {
        if (link === activeLink) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function updateActiveNavLinkOnScroll() {
    const scrollPosition = window.scrollY + 120;
    let currentSection = sectionLinks[0];

    sectionLinks.forEach((entry) => {
        if (entry.target.offsetTop <= scrollPosition) {
            currentSection = entry;
        }
    });

    if (currentSection) {
        setActiveNavLink(currentSection.link);
    }
}

function activateNavByHash() {
    const hash = window.location.hash || '#hero';
    const entry = sectionLinks.find((item) => item.link.getAttribute('href') === hash);
    if (entry) {
        setActiveNavLink(entry.link);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFinishedScore() {
    const winnerScore = 13;
    const loserScore = getRandomInt(0, 12);
    if (Math.random() < 0.5) {
        return { scoreA: winnerScore, scoreB: loserScore };
    }
    return { scoreA: loserScore, scoreB: winnerScore };
}

function generateOngoingScore() {
    const scoreA = getRandomInt(0, 11);
    const scoreB = getRandomInt(0, 11);
    return { scoreA, scoreB };
}

function generateTournamentMatches() {
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const startDate = new Date(2026, 4, 23, 10, 0); // 23 May 2026
    const slots = [
        '10:00', '11:45', '13:30', '15:15', '17:00', '18:45', '20:30'
    ];
    tournamentMatches = [];

    for (let i = 0; i < 6; i += 1) {
        const teamA = shuffledTeams[i * 2];
        const teamB = shuffledTeams[i * 2 + 1];
        const dayOffset = i < 3 ? 0 : 1;
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + dayOffset);
        matchDate.setHours(Number(slots[i].split(':')[0]));
        matchDate.setMinutes(Number(slots[i].split(':')[1]));
        const status = i === 0 ? 'Live' : Math.random() < 0.5 ? 'Terminé' : 'En cours';
        const { scoreA, scoreB } = status === 'Terminé' ? generateFinishedScore() : generateOngoingScore();

        tournamentMatches.push({
            id: `match-${i + 1}`,
            stage: matchStages[i],
            teamA,
            teamB,
            date: matchDate,
            time: slots[i],
            status,
            scoreA,
            scoreB,
            map: ['Nuke', 'Inferno', 'Mirage', 'Dust2', 'Ancient'][getRandomInt(0, 4)],
            logs: [
                `${teamA} domine les premiers rounds.`,
                `${teamB} cherche une réponse tactique.`,
                `${teamA} prend l'avantage en milieu de match.`
            ]
        });
    }
}

function formatMatchDate(match) {
    const day = match.date.getDate().toString().padStart(2, '0');
    const month = (match.date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}. ${match.time}`;
}

function renderMatchDetail(match) {
    const activeMatchHtml = `
        <div class="detailed-match-view">
            <div class="detail-header">
                <span class="stage">${match.stage}</span>
                <h3 class="modal-title">${match.teamA} vs ${match.teamB}</h3>
                <div class="time">${formatMatchDate(match)} · ${match.map}</div>
            </div>
            <div class="detail-board">
                <div class="detail-team">
                    <div class="logo">${match.teamA.charAt(0)}</div>
                    <div class="name">${match.teamA}</div>
                    <div class="captain">Score ${match.scoreA}</div>
                </div>
                <div class="detail-score ${match.status === 'Live' ? 'live-pulse' : ''}">${match.scoreA} - ${match.scoreB}</div>
                <div class="detail-team">
                    <div class="logo">${match.teamB.charAt(0)}</div>
                    <div class="name">${match.teamB}</div>
                    <div class="captain">Score ${match.scoreB}</div>
                </div>
            </div>
            <div class="detail-logs-section">
                <div class="logs-title">Dernières actions</div>
                <div class="logs-box">
                    ${match.logs.map((message, index) => `
                        <div class="log-row">
                            <span class="round-badge">R${index + 1}</span>
                            <span class="log-text">${message}</span>
                            <span class="cond">${index === 1 ? 'Réponse' : index === 2 ? 'Momentum' : 'Départ'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    selectors.matchDetailViewer.innerHTML = activeMatchHtml;
}

function renderMatches() {
    if (!selectors.matchesList) return;
    selectors.matchesList.innerHTML = '';

    tournamentMatches.forEach((match) => {
        const statusClass = match.status === 'Live' ? 'live' : match.status === 'Terminé' ? 'completed' : 'ongoing';
        const matchItem = document.createElement('div');
        matchItem.className = `match-item${selectedMatchId === match.id ? ' active' : ''}`;
        matchItem.dataset.matchId = match.id;
        matchItem.innerHTML = `
            <div class="match-item-header">
                <span class="stage-badge">${match.stage}</span>
                <span class="match-status-badge ${statusClass}">${match.status}</span>
            </div>
            <div class="match-item-body">
                <div class="match-team-row">
                    <span class="match-team-logo">${match.teamA.charAt(0)}</span>
                    <span>${match.teamA}</span>
                </div>
                <div class="match-scores-grid">
                    <div class="score-row">${match.scoreA} - ${match.scoreB}</div>
                    <div class="score-row" style="font-size:0.75rem; color:var(--text-muted);">${formatMatchDate(match)}</div>
                </div>
            </div>
        `;
        selectors.matchesList.appendChild(matchItem);
    });
}

function handleMatchSelection(event) {
    const matchItem = event.target.closest('.match-item');
    if (!matchItem) return;
    const matchId = matchItem.dataset.matchId;
    const match = tournamentMatches.find((item) => item.id === matchId);
    if (!match) return;

    selectedMatchId = matchId;
    renderMatches();
    renderMatchDetail(match);
}


const emptyCartMessageHtml = `
    <div class="empty-cart-message">
        <i class="fa-solid fa-box-open"></i>
        <p>Votre panier est vide. Choisissez vos billets ci-dessous !</p>
    </div>
`;

function formatCHF(value) {
    return `CHF ${value.toFixed(2).replace('.', ',')}`;
}

function getCartItemKey(item) {
    return `${item.ticketId}-${item.duration}`;
}

function findCartItemIndex(ticketId, duration) {
    return cartState.findIndex((item) => item.ticketId === ticketId && item.duration === duration);
}

function renderCart() {
    selectors.cartItemsContainer.innerHTML = '';

    if (cartState.length === 0) {
        selectors.cartItemsContainer.innerHTML = emptyCartMessageHtml;
        selectors.checkoutBtn.disabled = true;
        selectors.cartBadgeCount.textContent = '0';
        selectors.cartTotalPrice.textContent = '0.00 CHF';
        return;
    }

    cartState.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const cartItemNode = document.createElement('div');
        cartItemNode.className = 'cart-item';
        cartItemNode.innerHTML = `
            <div class="cart-item-header">
                <div>
                    <strong>${item.name}</strong>
                    <div class="text-muted" style="font-size:0.8rem; margin-top:4px;">${item.durationLabel}</div>
                </div>
                <button class="cart-item-remove" type="button" data-cart-index="${index}">Supprimer</button>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" type="button" data-action="decrease" data-cart-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" type="button" data-action="increase" data-cart-index="${index}">+</button>
                <span style="margin-left:auto; font-weight:700;">${formatCHF(itemTotal)}</span>
            </div>
        `;
        selectors.cartItemsContainer.appendChild(cartItemNode);
    });

    selectors.checkoutBtn.disabled = false;
    selectors.cartBadgeCount.textContent = cartState.reduce((sum, item) => sum + item.quantity, 0);
    selectors.cartTotalPrice.textContent = formatCHF(cartState.reduce((sum, item) => sum + item.price * item.quantity, 0));
}

function addToCart(ticketId, duration, price) {
    const ticket = ticketCatalog[ticketId];
    if (!ticket) return;

    const durationLabel = duration === '2' ? 'Pass 2 jours' : 'Entrée 1 jour';
    const existingIndex = findCartItemIndex(ticketId, duration);

    if (existingIndex >= 0) {
        cartState[existingIndex].quantity += 1;
    } else {
        cartState.push({
            ticketId,
            name: ticket.name,
            duration,
            durationLabel,
            price,
            quantity: 1,
        });
    }

    renderCart();
    openCart();
}

function openCart() {
    selectors.cartDrawer.classList.add('open');
}

function closeCart() {
    selectors.cartDrawer.classList.remove('open');
}

function openCheckoutModal() {
    selectors.checkoutModal.classList.add('open');
}

function closeCheckoutModal() {
    selectors.checkoutModal.classList.remove('open');
}

function handleCartActions(event) {
    const target = event.target.closest('[data-cart-index]');
    if (!target) return;

    const index = Number(target.dataset.cartIndex);
    const item = cartState[index];
    if (!item) return;

    if (target.classList.contains('cart-item-remove')) {
        cartState.splice(index, 1);
        renderCart();
        return;
    }

    if (target.dataset.action === 'increase') {
        item.quantity += 1;
        renderCart();
        return;
    }

    if (target.dataset.action === 'decrease') {
        item.quantity = Math.max(1, item.quantity - 1);
        renderCart();
        return;
    }
}

function attachEvents() {
    document.querySelectorAll('.add-ticket-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const ticketId = button.dataset.ticketId;
            const duration = button.dataset.duration;
            const price = Number(button.dataset.price);
            addToCart(ticketId, duration, price);
        });
    });

    selectors.navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            setActiveNavLink(link);
        });
    });

    selectors.cartToggle.addEventListener('click', openCart);
    selectors.closeCart.addEventListener('click', closeCart);
    selectors.cartItemsContainer.addEventListener('click', handleCartActions);

    selectors.checkoutBtn.addEventListener('click', () => {
        if (cartState.length === 0) return;
        openCheckoutModal();
    });

    selectors.closeCheckoutModal.addEventListener('click', closeCheckoutModal);
    selectors.finishCheckoutBtn.addEventListener('click', () => {
        closeCheckoutModal();
        cartState.length = 0;
        renderCart();
    });

    // Login modal handlers
    if (selectors.loginBtn) selectors.loginBtn.addEventListener('click', () => {
        if (selectors.loginModal) selectors.loginModal.classList.add('open');
    });
    if (selectors.loginClose) selectors.loginClose.addEventListener('click', () => {
        if (selectors.loginModal) selectors.loginModal.classList.remove('open');
    });
    if (selectors.loginCancel) selectors.loginCancel.addEventListener('click', () => {
        if (selectors.loginModal) selectors.loginModal.classList.remove('open');
    });

    if (selectors.loginForm) {
        selectors.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!selectors.loginEmail || !selectors.loginPassword) return;
            const email = selectors.loginEmail.value.trim();
            const password = selectors.loginPassword.value;
            selectors.loginError.style.display = 'none';

            try {
                const resp = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const body = await resp.json();
                if (!resp.ok) {
                    selectors.loginError.textContent = body.error || 'Erreur de connexion.';
                    selectors.loginError.style.display = 'block';
                    return;
                }

                // Success: update UI and close modal
                const user = body.user;
                if (selectors.loginBtn) selectors.loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> <span>${user.first_name || user.email}</span>`;
                if (selectors.loginModal) selectors.loginModal.classList.remove('open');
                selectors.loginForm.reset();
            } catch (err) {
                selectors.loginError.textContent = 'Impossible de contacter le serveur.';
                selectors.loginError.style.display = 'block';
            }
        });
    }

    // Toggle to signup
    if (selectors.showSignup) {
        selectors.showSignup.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (selectors.loginForm) selectors.loginForm.style.display = 'none';
            if (selectors.signupForm) selectors.signupForm.style.display = 'block';
            if (selectors.loginError) selectors.loginError.style.display = 'none';
        });
    }
    if (selectors.showLogin) {
        selectors.showLogin.addEventListener('click', (ev) => {
            ev.preventDefault();
            if (selectors.signupForm) selectors.signupForm.style.display = 'none';
            if (selectors.loginForm) selectors.loginForm.style.display = 'block';
            if (selectors.signupError) selectors.signupError.style.display = 'none';
            if (selectors.signupSuccess) selectors.signupSuccess.style.display = 'none';
        });
    }

    // Signup handlers
    if (selectors.signupCancel) selectors.signupCancel.addEventListener('click', () => {
        if (selectors.signupForm) selectors.signupForm.style.display = 'none';
        if (selectors.loginForm) selectors.loginForm.style.display = 'block';
    });

    if (selectors.signupForm) {
        selectors.signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const first = selectors.signupFirst.value.trim();
            const last = selectors.signupLast.value.trim();
            const email = selectors.signupEmail.value.trim();
            const password = selectors.signupPassword.value;
            selectors.signupError.style.display = 'none';
            selectors.signupSuccess.style.display = 'none';

            if (!first || !last || !email || !password) {
                selectors.signupError.textContent = 'Tous les champs sont requis.';
                selectors.signupError.style.display = 'block';
                return;
            }

            try {
                const resp = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ first_name: first, last_name: last, email, password })
                });
                const body = await resp.json();
                if (!resp.ok) {
                    selectors.signupError.textContent = body.error || 'Erreur lors de l\'inscription.';
                    selectors.signupError.style.display = 'block';
                    return;
                }

                selectors.signupSuccess.textContent = 'Inscription réussie — vous êtes connecté.';
                selectors.signupSuccess.style.display = 'block';

                // Update UI as logged in
                const user = body.user;
                if (selectors.loginBtn) selectors.loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> <span>${user.first_name || user.email}</span>`;
                if (selectors.loginModal) selectors.loginModal.classList.remove('open');
                selectors.signupForm.reset();
            } catch (err) {
                selectors.signupError.textContent = 'Impossible de contacter le serveur.';
                selectors.signupError.style.display = 'block';
            }
        });
    }

    selectors.matchesList.addEventListener('click', handleMatchSelection);
    window.addEventListener('scroll', updateActiveNavLinkOnScroll, { passive: true });
    window.addEventListener('hashchange', activateNavByHash);
}

window.addEventListener('DOMContentLoaded', () => {
    generateTournamentMatches();
    selectedMatchId = tournamentMatches[0]?.id || null;
    renderMatches();
    renderMatchDetail(tournamentMatches[0]);
    renderCart();
    attachEvents();
    activateNavByHash();
});
