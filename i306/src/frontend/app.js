/* ==========================================================================
   EVENT CS 2026 — CLIENT APPLICATION CODE
   Handles SPA routes, cart operations, multi-step payments, bracket views,
   real-time score polling, and secure back-office admin controls.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // OFFLINE DATABASE SIMULATION (localStorage)
    // ==========================================
    const isFileProtocol = window.location.protocol === 'file:';

    function initLocalDatabase() {
        if (!localStorage.getItem('event_cs_teams')) {
            localStorage.setItem('event_cs_teams', JSON.stringify([
                { id: 1, name: 'Team BDS', logo: '🛡️', captain: 'Maka', rank: 12 },
                { id: 2, name: 'Team Vitality', logo: '🐝', captain: 'apEX', rank: 3 },
                { id: 3, name: 'G2 Esports', logo: ' samurai ', captain: 'Snax', rank: 4 },
                { id: 4, name: 'Natus Vincere', logo: '⚡', captain: 'Aleksib', rank: 2 }
            ]));
        }
        if (!localStorage.getItem('event_cs_matches')) {
            const localTeams = JSON.parse(localStorage.getItem('event_cs_teams'));
            localStorage.setItem('event_cs_matches', JSON.stringify([
                {
                    id: 1,
                    teamA: localTeams[1],
                    teamB: localTeams[2],
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
                    teamA: localTeams[3],
                    teamB: localTeams[0],
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
                    teamA: localTeams[2],
                    teamB: localTeams[0],
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
                    teamA: localTeams[1],
                    teamB: localTeams[3],
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
            ]));
        }
        if (!localStorage.getItem('event_cs_tickets')) {
            localStorage.setItem('event_cs_tickets', JSON.stringify([
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
            ]));
        }
        if (!localStorage.getItem('event_cs_orders')) {
            localStorage.setItem('event_cs_orders', JSON.stringify([
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
            ]));
        }
    }

    if (isFileProtocol) {
        initLocalDatabase();

        // Monkey patch window.fetch
        const originalFetch = window.fetch;
        window.fetch = async function(url, options = {}) {
            const path = typeof url === 'string' ? url : url.url;
            const method = options.method ? options.method.toUpperCase() : 'GET';
            const body = options.body ? JSON.parse(options.body) : null;
            
            const mockResponse = (data, status = 200) => {
                return {
                    ok: status >= 200 && status < 300,
                    status: status,
                    json: async () => data,
                    text: async () => JSON.stringify(data)
                };
            };

            // GET /api/tickets
            if (path === '/api/tickets' && method === 'GET') {
                const tickets = JSON.parse(localStorage.getItem('event_cs_tickets'));
                return mockResponse(tickets);
            }
            
            // GET /api/teams
            if (path === '/api/teams' && method === 'GET') {
                const teams = JSON.parse(localStorage.getItem('event_cs_teams'));
                return mockResponse(teams);
            }
            
            // GET /api/matches
            if (path === '/api/matches' && method === 'GET') {
                const matches = JSON.parse(localStorage.getItem('event_cs_matches'));
                return mockResponse(matches);
            }
            
            // GET /api/admin/orders
            if (path === '/api/admin/orders' && method === 'GET') {
                const orders = JSON.parse(localStorage.getItem('event_cs_orders'));
                return mockResponse(orders);
            }
            
            // GET /api/admin/financials
            if (path === '/api/admin/financials' && method === 'GET') {
                const tickets = JSON.parse(localStorage.getItem('event_cs_tickets'));
                const SPONSORSHIP_REVENUE = 84200.00;
                const ticketRevenue = tickets.reduce((acc, cat) => {
                    const sold = cat.total - cat.available;
                    return acc + (sold * cat.price);
                }, 0);
                const totalRevenue = ticketRevenue + SPONSORSHIP_REVENUE;
                const ticketsSold = tickets.reduce((acc, cat) => acc + (cat.total - cat.available), 0);
                const totalTickets = tickets.reduce((acc, cat) => acc + cat.total, 0);
                
                return mockResponse({
                    ticketsSold,
                    totalTickets,
                    ticketRevenue,
                    sponsorships: SPONSORSHIP_REVENUE,
                    totalRevenue,
                    targetMin: 90000.00,
                    targetMax: 110000.00
                });
            }
            
            // POST /api/tickets/purchase
            if (path === '/api/tickets/purchase' && method === 'POST') {
                const { name, email, paymentMethod, items, cardBrand, cardNumberMasked } = body;
                
                if (!name || !email || !paymentMethod || !items || !items.length) {
                    return mockResponse({ error: 'Données de commande incomplètes.' }, 400);
                }
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return mockResponse({ error: 'Format d\'adresse e-mail invalide.' }, 400);
                }
                if (typeof name !== 'string' || name.trim().length < 2) {
                    return mockResponse({ error: 'Le nom complet doit comporter au moins 2 caractères.' }, 400);
                }
                
                if (paymentMethod === 'Carte de Crédit') {
                    if (!cardBrand || !cardNumberMasked) {
                        return mockResponse({ error: 'Informations de carte bancaire manquantes.' }, 400);
                    }
                }
                
                const localTickets = JSON.parse(localStorage.getItem('event_cs_tickets'));
                let totalCost = 0;
                const purchasedItems = [];
                
                for (const item of items) {
                    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                        return mockResponse({ error: 'La quantité de billets doit être un entier positif.' }, 400);
                    }
                    const category = localTickets.find(c => c.id === item.categoryId);
                    if (!category) {
                        return mockResponse({ error: `Catégorie de billet ID ${item.categoryId} inexistante.` }, 404);
                    }
                    if (category.available < item.quantity) {
                        return mockResponse({ error: `Quantité insuffisante pour ${category.name}. Reste: ${category.available}` }, 400);
                    }
                    category.available -= item.quantity;
                    totalCost += category.price * item.quantity;
                    purchasedItems.push({
                        name: category.name,
                        quantity: item.quantity,
                        price: category.price
                    });
                }
                
                localStorage.setItem('event_cs_tickets', JSON.stringify(localTickets));
                
                let displayMethod = paymentMethod;
                if (paymentMethod === 'Carte de Crédit') {
                    displayMethod = `Carte (${cardBrand.charAt(0) + cardBrand.slice(1).toLowerCase()}) ${cardNumberMasked}`;
                }
                
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
                
                const localOrders = JSON.parse(localStorage.getItem('event_cs_orders'));
                localOrders.unshift(newOrder);
                localStorage.setItem('event_cs_orders', JSON.stringify(localOrders));
                
                return mockResponse({
                    success: true,
                    order: newOrder,
                    message: 'Billets achetés avec succès ! (Simulation locale)'
                });
            }
            
            // PUT /api/admin/tickets/:id
            if (path.startsWith('/api/admin/tickets/') && method === 'PUT') {
                const id = parseInt(path.split('/').pop(), 10);
                const { name, description, price, total, available } = body;
                
                const localTickets = JSON.parse(localStorage.getItem('event_cs_tickets'));
                const cat = localTickets.find(c => c.id === id);
                
                if (!cat) {
                    return mockResponse({ error: 'Catégorie non trouvée' }, 404);
                }
                
                if (name !== undefined) cat.name = name;
                if (description !== undefined) cat.description = description;
                if (price !== undefined) cat.price = parseFloat(price);
                if (total !== undefined) cat.total = parseInt(total);
                if (available !== undefined) cat.available = parseInt(available);
                
                localStorage.setItem('event_cs_tickets', JSON.stringify(localTickets));
                return mockResponse({ success: true, ticket: cat });
            }
            
            // POST /api/auth/login
            if (path === '/api/auth/login' && method === 'POST') {
                const { email, password } = body;
                const ADMIN_EMAIL = 'admin@eventandparty.ch';
                const ADMIN_PASSWORD = 'admin';
                
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    window.activeLocal2FA = {
                        email,
                        code,
                        expires: Date.now() + 5 * 60 * 1000
                    };
                    
                    return mockResponse({
                        success: true,
                        requires2FA: true,
                        message: 'Code de sécurité généré.',
                        demoCode: code
                    });
                } else {
                    return mockResponse({ error: 'Identifiants invalides.' }, 401);
                }
            }
            
            // POST /api/auth/verify-2fa
            if (path === '/api/auth/verify-2fa' && method === 'POST') {
                const { email, code } = body;
                const record = window.activeLocal2FA;
                
                if (record && record.email === email && record.code === code && Date.now() < record.expires) {
                    window.activeLocal2FA = null;
                    return mockResponse({
                        success: true,
                        token: 'mock-jwt-token-event-cs-2026',
                        user: {
                            email,
                            name: 'Administrateur EventAndParty',
                            role: 'admin'
                        }
                    });
                } else {
                    return mockResponse({ error: 'Code 2FA incorrect ou expiré.' }, 400);
                }
            }
            
            // POST /api/matches/:id
            if (path.startsWith('/api/matches/') && method === 'POST') {
                const id = parseInt(path.split('/').pop(), 10);
                const { scoreA, scoreB, status, winner, logText, logCondition } = body;
                
                const localMatches = JSON.parse(localStorage.getItem('event_cs_matches'));
                const match = localMatches.find(m => m.id === id);
                
                if (!match) {
                    return mockResponse({ error: 'Match non trouvé' }, 404);
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
                
                localStorage.setItem('event_cs_matches', JSON.stringify(localMatches));
                return mockResponse({ success: true, match });
            }
            
            return originalFetch(url, options);
        };

        // Live Round Logs simulation (file:// mode)
        setInterval(() => {
            const localMatches = JSON.parse(localStorage.getItem('event_cs_matches'));
            const grandFinal = localMatches.find(m => m.id === 4);
            if (grandFinal && grandFinal.status === 'live') {
                const isScoreA = Math.random() > 0.48;
                if (isScoreA) grandFinal.scoreA++;
                else grandFinal.scoreB++;
                
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
                
                if (grandFinal.logs.length > 10) grandFinal.logs.pop();
                
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
                
                localStorage.setItem('event_cs_matches', JSON.stringify(localMatches));
            }
        }, 20000);
    }

    // --- APPLICATION STATE ---
    let appState = {
        tickets: [],
        matches: [],
        teams: [],
        cart: [], // { categoryId, name, quantity, price }
        adminUser: null,
        adminToken: null,
        twoFactorEmail: null,
        selectedMatchId: 4 // default view of NaVi vs Vitality
    };

    // --- SEED LOCATIONS ---
    const API_URLS = {
        tickets: '/api/tickets',
        teams: '/api/teams',
        matches: '/api/matches',
        purchase: '/api/tickets/purchase',
        adminOrders: '/api/admin/orders',
        adminFinancials: '/api/admin/financials',
        adminTicketsUpdate: (id) => `/api/admin/tickets/${id}`,
        login: '/api/auth/login',
        verify2FA: '/api/auth/verify-2fa'
    };

    // ==========================================
    // DOM ELEMENTS SELECTORS
    // ==========================================
    
    // Nav Links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Cart elements
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Checkout modal elements
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModal = document.getElementById('close-checkout-modal');
    const step1Indicator = document.getElementById('step-1-indicator');
    const step2Indicator = document.getElementById('step-2-indicator');
    const step3Indicator = document.getElementById('step-3-indicator');
    const step1Content = document.getElementById('checkout-step-1');
    const step2Content = document.getElementById('checkout-step-2');
    const step3Content = document.getElementById('checkout-step-3');
    
    const contactForm = document.getElementById('contact-form');
    const creditCardForm = document.getElementById('credit-card-form');
    const checkoutName = document.getElementById('checkout-name');
    const checkoutEmail = document.getElementById('checkout-email');
    
    const payTwintCard = document.getElementById('pay-twint-card');
    const payCardCard = document.getElementById('pay-card-card');
    const twintDetailsPanel = document.getElementById('twint-details-panel');
    const cardDetailsPanel = document.getElementById('card-details-panel');
    const checkoutTotalVals = document.querySelectorAll('.checkout-total-val');
    
    const backToStep1 = document.getElementById('back-to-step-1');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const finishCheckoutBtn = document.getElementById('finish-checkout-btn');

    // New Credit Card inputs and errors selectors
    const cardNum = document.getElementById('card-num');
    const cardExp = document.getElementById('card-exp');
    const cardCvc = document.getElementById('card-cvc');
    const cardBrandIcon = document.getElementById('card-brand-icon');
    const cardNumError = document.getElementById('card-num-error');
    const cardExpError = document.getElementById('card-exp-error');
    const cardCvcError = document.getElementById('card-cvc-error');

    // 3D Secure mock elements selectors
    const secure3dsModal = document.getElementById('secure-3ds-modal');
    const secure3dsBody = document.getElementById('secure-3ds-body');
    const secure3dsLoading = document.getElementById('secure-3ds-loading');
    const secure3dsOtp = document.getElementById('secure-3ds-otp');
    const secure3dsForm = document.getElementById('secure-3ds-form');
    const secure3dsOtpField = document.getElementById('secure-3ds-otp-field');
    const secure3dsError = document.getElementById('secure-3ds-error');
    const demo3dsCode = document.getElementById('demo-3ds-code');
    const cancel3dsBtn = document.getElementById('cancel-3ds-btn');
    
    // Receipt Details
    const receiptTicketName = document.getElementById('receipt-ticket-name');
    const receiptHolderName = document.getElementById('receipt-holder-name');
    const receiptOrderId = document.getElementById('receipt-order-id');

    // Live display cards
    const ticketsCardsGrid = document.getElementById('tickets-cards-grid');
    const matchesListContainer = document.getElementById('matches-list-container');
    const matchDetailViewer = document.getElementById('match-detail-viewer');
    
    // Hero preview monitor
    const streamScoreA = document.getElementById('stream-score-a');
    const streamScoreB = document.getElementById('stream-score-b');
    const streamDynamicTicker = document.getElementById('stream-dynamic-ticker');

    // Admin & Authentication overlay
    const adminPortalBtn = document.getElementById('admin-portal-btn');
    const adminFullOverlay = document.getElementById('admin-full-overlay');
    const closeAdminOverlayBtn = document.getElementById('close-admin-overlay-btn');
    const adminLoginView = document.getElementById('admin-login-view');
    const admin2FAView = document.getElementById('admin-2fa-view');
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminEmailField = document.getElementById('admin-email-field');
    const adminPasswordField = document.getElementById('admin-password-field');
    
    const admin2FAForm = document.getElementById('admin-2fa-form');
    const otpDigitField = document.getElementById('2fa-digit');
    const demo2FACodePlaceholder = document.getElementById('demo-2fa-code-placeholder');
    const demo2FABox = document.getElementById('demo-2fa-box');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    
    // Admin Dashboard tabs & actions
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    
    // Admin panels tables
    const adminTicketsTableBody = document.getElementById('admin-tickets-table-body');
    const adminOrdersTableBody = document.getElementById('admin-orders-table-body');
    const adminMatchesControlContainer = document.getElementById('admin-matches-control-container');

    // Financial Metrics
    const financialValCurrent = document.getElementById('financial-val-current');
    const financialProgressBar = document.getElementById('financial-progress-bar');
    const financialTicketsShare = document.getElementById('financial-tickets-share');
    const financialSponsorsShare = document.getElementById('financial-sponsors-share');
    const statTicketsSold = document.getElementById('stat-tickets-sold');

    // Ticket Edit Modal
    const ticketEditModal = document.getElementById('ticket-edit-modal');
    const closeTicketEditModal = document.getElementById('close-ticket-edit-modal');
    const ticketEditForm = document.getElementById('ticket-edit-form');
    const editTicketId = document.getElementById('edit-ticket-id');
    const editTicketName = document.getElementById('edit-ticket-name');
    const editTicketDesc = document.getElementById('edit-ticket-desc');
    const editTicketPrice = document.getElementById('edit-ticket-price');
    const editTicketTotal = document.getElementById('edit-ticket-total');
    const editTicketAvail = document.getElementById('edit-ticket-avail');

    // ==========================================
    // INITIALIZATION & CORE LOADING
    // ==========================================
    
    async function initApp() {
        await fetchTickets();
        await fetchTeams();
        await fetchMatches();
        
        // Start Polling for Live updates every 5 seconds
        setInterval(async () => {
            await fetchMatches(true); // silent update
        }, 5000);
    }

    // Nav active link handlers
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // ==========================================
    // DATA FETCHING FUNCTIONS
    // ==========================================
    
    async function fetchTickets() {
        try {
            const res = await fetch(API_URLS.tickets);
            appState.tickets = await res.json();
            renderTickets();
            if (appState.adminToken) {
                renderAdminTicketsTable();
            }
        } catch (e) {
            console.error('Error fetching tickets:', e);
        }
    }

    async function fetchTeams() {
        try {
            const res = await fetch(API_URLS.teams);
            appState.teams = await res.json();
        } catch (e) {
            console.error('Error fetching teams:', e);
        }
    }

    async function fetchMatches(silent = false) {
        try {
            const res = await fetch(API_URLS.matches);
            appState.matches = await res.json();
            
            // If the selected match is being updated, render it
            renderMatchesList();
            renderDetailedMatch();
            renderHeroMonitor();

            if (appState.adminToken && !silent) {
                renderAdminMatchesControl();
            }
        } catch (e) {
            console.error('Error fetching matches:', e);
        }
    }

    // ==========================================
    // FRONT-OFFICE RENDERING
    // ==========================================
    
    // 1. Render Ticketing grid cards
    function renderTickets() {
        ticketsCardsGrid.innerHTML = '';
        appState.tickets.forEach(ticket => {
            const pctAvailable = Math.round((ticket.available / ticket.total) * 100);
            const isVIP = ticket.name.toLowerCase().includes('vip');
            const isGold = ticket.name.toLowerCase().includes('gold');
            
            const card = document.createElement('div');
            card.className = `ticket-card ${isVIP ? 'vip' : ''}`;
            
            card.innerHTML = `
                ${isVIP ? '<span class="ticket-tag">VIP</span>' : ''}
                ${isGold ? '<span class="ticket-tag" style="background: rgba(245,158,11,0.2); border-color: var(--warning); color: var(--warning)">COLL.</span>' : ''}
                <div>
                    <h3 class="ticket-name">${ticket.name}</h3>
                    <p class="ticket-desc">${ticket.description}</p>
                </div>
                
                <div>
                    <div class="ticket-stock">
                        <span>Places dispos :</span>
                        <span class="${ticket.available < 15 ? 'text-accent' : 'text-primary'}">${ticket.available} / ${ticket.total}</span>
                    </div>
                    
                    <div class="stock-indicator-bar">
                        <div class="stock-indicator-fill" style="width: ${pctAvailable}%"></div>
                    </div>

                    <div class="ticket-price-row">
                        <span class="price-currency">CHF / Billet</span>
                        <span class="price-val">${ticket.price.toFixed(2)}</span>
                    </div>

                    <button class="btn ${isVIP ? 'btn-primary' : 'btn-outline'} btn-block add-to-cart-btn" 
                            data-id="${ticket.id}" 
                            ${ticket.available === 0 ? 'disabled' : ''}>
                        ${ticket.available === 0 ? 'ÉPUISÉ' : '<i class="fa-solid fa-plus"></i> Ajouter au panier'}
                    </button>
                </div>
            `;
            
            // Add to Cart handler
            card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                addToCart(ticket.id);
            });
            
            ticketsCardsGrid.appendChild(card);
        });
    }

    // 2. Render Hero Stream Preview
    function renderHeroMonitor() {
        const grandFinal = appState.matches.find(m => m.id === 4);
        if (grandFinal) {
            streamScoreA.innerText = grandFinal.scoreA;
            streamScoreB.innerText = grandFinal.scoreB;
            
            if (grandFinal.logs.length > 0) {
                const latestLog = grandFinal.logs[0];
                streamDynamicTicker.innerHTML = `<i class="fa-solid fa-burst"></i> ${latestLog.text}`;
            } else {
                streamDynamicTicker.innerHTML = `<i class="fa-solid fa-gamepad"></i> Attente du lancement du match...`;
            }
        }
    }

    // 3. Render Bracket matches sidebar list
    function renderMatchesList() {
        matchesListContainer.innerHTML = '';
        appState.matches.forEach(match => {
            const isActive = match.id === appState.selectedMatchId;
            const item = document.createElement('div');
            item.className = `match-item ${isActive ? 'active' : ''}`;
            
            const isCompleted = match.status === 'completed';
            const isLive = match.status === 'live';
            
            item.innerHTML = `
                <div class="match-item-header">
                    <span class="stage-badge">${match.stage}</span>
                    <span class="match-status-badge ${match.status}">
                        ${isLive ? '<span class="pulse-dot"></span> DIRECT' : isCompleted ? 'Terminé' : match.time}
                    </span>
                </div>
                <div class="match-item-body">
                    <div>
                        <div class="match-team-row ${match.winner === match.teamA.name ? 'winner' : ''}">
                            <span class="match-team-logo">${match.teamA.logo}</span>
                            <span>${match.teamA.name}</span>
                        </div>
                        <div class="match-team-row ${match.winner === match.teamB.name ? 'winner' : ''}">
                            <span class="match-team-logo">${match.teamB.logo}</span>
                            <span>${match.teamB.name}</span>
                        </div>
                    </div>
                    <div class="match-scores-grid">
                        <div class="score-row">${isCompleted || isLive ? match.scoreA : '-'}</div>
                        <div class="score-row">${isCompleted || isLive ? match.scoreB : '-'}</div>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                appState.selectedMatchId = match.id;
                renderDetailedMatch();
                renderMatchesList(); // reset active classes
            });
            
            matchesListContainer.appendChild(item);
        });
    }

    // 4. Render selected match in main viewport
    function renderDetailedMatch() {
        const match = appState.matches.find(m => m.id === appState.selectedMatchId);
        if (!match) return;

        matchDetailViewer.innerHTML = '';
        
        const isLive = match.status === 'live';
        const isCompleted = match.status === 'completed';

        const detailCard = document.createElement('div');
        detailCard.className = 'detailed-match-view';
        
        let logsHTML = '';
        if (match.logs && match.logs.length > 0) {
            match.logs.forEach(log => {
                logsHTML += `
                    <div class="log-row">
                        <span class="round-badge">R${log.round || '?'}</span>
                        <span class="log-text">${log.text}</span>
                        <span class="cond ${log.condition || 'elimination'}">${log.condition === 'defusal' ? 'Désamorçage' : log.condition === 'explosion' ? 'Explosion' : 'Élimination'}</span>
                    </div>
                `;
            });
        } else {
            logsHTML = `
                <div class="panel-empty-state" style="min-height: auto; padding: 20px;">
                    <p style="font-size:0.85rem;"><i class="fa-regular fa-clock" style="font-size: 1.5rem; margin-bottom: 5px;"></i><br>Aucun log disponible. Match à venir.</p>
                </div>
            `;
        }

        detailCard.innerHTML = `
            <div class="detail-header">
                <span class="stage">${match.stage}</span>
                <div class="time">${isLive ? '<span class="pulse-dot"></span> MATCH EN DIRECT' : isCompleted ? 'MATCH TERMINÉ' : match.time}</div>
            </div>

            <div class="detail-board">
                <div class="detail-team">
                    <div class="logo">${match.teamA.logo}</div>
                    <div class="name">${match.teamA.name}</div>
                    <div class="captain">Capt: ${match.teamA.captain}</div>
                </div>

                <div class="detail-score ${isLive ? 'live-pulse' : ''}">
                    ${isCompleted || isLive ? `${match.scoreA} : ${match.scoreB}` : 'VS'}
                </div>

                <div class="detail-team">
                    <div class="logo">${match.teamB.logo}</div>
                    <div class="name">${match.teamB.name}</div>
                    <div class="captain">Capt: ${match.teamB.captain}</div>
                </div>
            </div>

            <div class="detail-logs-section">
                <h4 class="logs-title"><i class="fa-solid fa-receipt text-primary"></i> Journal des Événements</h4>
                <div class="logs-box">
                    ${logsHTML}
                </div>
            </div>
        `;
        
        matchDetailViewer.appendChild(detailCard);
    }

    // ==========================================
    // SHOPPING CART SYSTEM
    // ==========================================
    
    // Toggle Drawer Open/Close
    cartToggleBtn.addEventListener('click', () => {
        cartDrawer.classList.toggle('open');
    });
    
    closeCartBtn.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
    });

    function addToCart(categoryId) {
        const ticket = appState.tickets.find(t => t.id === categoryId);
        if (!ticket) return;

        const cartItem = appState.cart.find(item => item.categoryId === categoryId);
        
        // Check local stock
        const currentQty = cartItem ? cartItem.quantity : 0;
        if (ticket.available <= currentQty) {
            alert(`Stock insuffisant. Seuls ${ticket.available} billets sont encore disponibles.`);
            return;
        }

        if (cartItem) {
            cartItem.quantity++;
        } else {
            appState.cart.push({
                categoryId: ticket.id,
                name: ticket.name,
                quantity: 1,
                price: ticket.price
            });
        }
        
        updateCartUI();
        cartDrawer.classList.add('open'); // slide open to show item added
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        
        if (appState.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fa-solid fa-box-open"></i>
                    <p>Votre panier est vide. Choisissez vos billets ci-dessous !</p>
                </div>
            `;
            cartBadgeCount.innerText = '0';
            cartTotalPrice.innerText = '0.00 CHF';
            checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        let count = 0;

        appState.cart.forEach(item => {
            total += item.price * item.quantity;
            count += item.quantity;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-header">
                    <span>${item.name}</span>
                    <button class="cart-item-remove" data-id="${item.categoryId}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn minus" data-id="${item.categoryId}">-</button>
                    <span class="qty-val font-orbitron">${item.quantity}</span>
                    <button class="qty-btn plus" data-id="${item.categoryId}">+</button>
                    <span class="ml-auto text-primary" style="margin-left:auto">${(item.price * item.quantity).toFixed(2)} CHF</span>
                </div>
            `;

            // Listeners
            div.querySelector('.qty-btn.minus').addEventListener('click', () => adjustQty(item.categoryId, -1));
            div.querySelector('.qty-btn.plus').addEventListener('click', () => adjustQty(item.categoryId, 1));
            div.querySelector('.cart-item-remove').addEventListener('click', () => removeFromCart(item.categoryId));

            cartItemsContainer.appendChild(div);
        });

        cartBadgeCount.innerText = count;
        cartTotalPrice.innerText = `${total.toFixed(2)} CHF`;
        checkoutBtn.disabled = false;

        // Set value in checkout overlays
        checkoutTotalVals.forEach(val => {
            val.innerText = `${total.toFixed(2)} CHF`;
        });
    }

    function adjustQty(categoryId, delta) {
        const item = appState.cart.find(i => i.categoryId === categoryId);
        const ticket = appState.tickets.find(t => t.id === categoryId);
        if (!item || !ticket) return;

        if (delta > 0 && ticket.available <= item.quantity) {
            alert(`Pas assez de places disponibles.`);
            return;
        }

        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(categoryId);
        } else {
            updateCartUI();
        }
    }

    function removeFromCart(categoryId) {
        appState.cart = appState.cart.filter(item => item.categoryId !== categoryId);
        updateCartUI();
    }

    // ==========================================
    // MULTI-STEP CHECKOUT & PAYMENT SIMULATION
    // ==========================================
    
    // Checkout trigger
    checkoutBtn.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        openCheckoutStep(1);
        checkoutModal.classList.add('open');
    });

    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
    });

    function openCheckoutStep(step) {
        step1Indicator.classList.remove('active');
        step2Indicator.classList.remove('active');
        step3Indicator.classList.remove('active');
        step1Content.classList.remove('active');
        step2Content.classList.remove('active');
        step3Content.classList.remove('active');

        if (step === 1) {
            step1Indicator.classList.add('active');
            step1Content.classList.add('active');
        } else if (step === 2) {
            step2Indicator.classList.add('active');
            step2Content.classList.add('active');
        } else if (step === 3) {
            step3Indicator.classList.add('active');
            step3Content.classList.add('active');
        }
    }

    // ==========================================
    // CREDIT CARD FORMATTING & VALIDATION
    // ==========================================

    function validateLuhn(number) {
        let sum = 0;
        let isSecond = false;
        const cleanNumber = number.replace(/\s+/g, '');
        if (!/^\d+$/.test(cleanNumber)) return false;
        
        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let d = parseInt(cleanNumber.charAt(i), 10);
            if (isSecond) {
                d = d * 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            isSecond = !isSecond;
        }
        return (sum % 10 === 0);
    }

    function getCardBrand(number) {
        const cleanNumber = number.replace(/\s+/g, '');
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber) || /^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[0-1]\d|2720)/.test(cleanNumber)) return 'mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'amex';
        return 'unknown';
    }

    function updateCardBrandIcon(brand) {
        cardBrandIcon.className = 'card-brand-icon';
        if (brand === 'visa') {
            cardBrandIcon.classList.add('visa');
            cardBrandIcon.innerHTML = '<i class="fa-brands fa-cc-visa"></i>';
        } else if (brand === 'mastercard') {
            cardBrandIcon.classList.add('mastercard');
            cardBrandIcon.innerHTML = '<i class="fa-brands fa-cc-mastercard"></i>';
        } else if (brand === 'amex') {
            cardBrandIcon.classList.add('amex');
            cardBrandIcon.innerHTML = '<i class="fa-brands fa-cc-amex"></i>';
        } else {
            cardBrandIcon.innerHTML = '<i class="fa-solid fa-credit-card"></i>';
        }
    }

    function validateExpiry(exp) {
        if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
        const [monthStr, yearStr] = exp.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10) + 2000;
        
        if (month < 1 || month > 12) return false;
        
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        
        return true;
    }

    function validateCVC(cvc, brand) {
        const cleanCvc = cvc.trim();
        if (!/^\d+$/.test(cleanCvc)) return false;
        if (brand === 'amex') {
            return cleanCvc.length === 4;
        }
        return cleanCvc.length === 3;
    }

    function validateCardForm() {
        let isValid = true;
        
        const numVal = cardNum.value;
        const brand = getCardBrand(numVal);
        
        if (!numVal) {
            cardNum.classList.add('invalid');
            cardNumError.innerText = 'Numéro de carte requis.';
            isValid = false;
        } else if (!validateLuhn(numVal)) {
            cardNum.classList.add('invalid');
            cardNumError.innerText = 'Numéro de carte invalide (Luhn échoué).';
            isValid = false;
        } else {
            cardNum.classList.remove('invalid');
            cardNumError.innerText = '';
        }
        
        const expVal = cardExp.value;
        if (!expVal) {
            cardExp.classList.add('invalid');
            cardExpError.innerText = 'Date d\'expiration requise.';
            isValid = false;
        } else if (!validateExpiry(expVal)) {
            cardExp.classList.add('invalid');
            cardExpError.innerText = 'Date invalide (MM/AA, future).';
            isValid = false;
        } else {
            cardExp.classList.remove('invalid');
            cardExpError.innerText = '';
        }
        
        const cvcVal = cardCvc.value;
        if (!cvcVal) {
            cardCvc.classList.add('invalid');
            cardCvcError.innerText = 'CVC requis.';
            isValid = false;
        } else if (!validateCVC(cvcVal, brand)) {
            cardCvc.classList.add('invalid');
            cardCvcError.innerText = brand === 'amex' ? 'CVC invalide (4 chiffres requis).' : 'CVC invalide (3 chiffres requis).';
            isValid = false;
        } else {
            cardCvc.classList.remove('invalid');
            cardCvcError.innerText = '';
        }
        
        return isValid;
    }

    // Auto-formatting listeners
    cardNum.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formatted += ' ';
            formatted += value[i];
        }
        e.target.value = formatted;
        
        const brand = getCardBrand(formatted);
        updateCardBrandIcon(brand);
        
        cardNum.classList.remove('invalid');
        cardNumError.innerText = '';
    });

    cardExp.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
            e.target.value = value;
        }
        cardExp.classList.remove('invalid');
        cardExpError.innerText = '';
    });

    cardCvc.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
        cardCvc.classList.remove('invalid');
        cardCvcError.innerText = '';
    });

    // Step 1 Submit
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        openCheckoutStep(2);
    });

    // Step 2 Payment Cards Selection
    payTwintCard.addEventListener('click', () => {
        payTwintCard.classList.add('active');
        payCardCard.classList.remove('active');
        twintDetailsPanel.classList.add('active');
        cardDetailsPanel.classList.remove('active');
    });

    payCardCard.addEventListener('click', () => {
        payCardCard.classList.add('active');
        payTwintCard.classList.remove('active');
        cardDetailsPanel.classList.add('active');
        twintDetailsPanel.classList.remove('active');
    });

    backToStep1.addEventListener('click', () => openCheckoutStep(1));

    let current3dsCode = null;
    let pendingPurchaseData = null;

    // Confirm Payment
    confirmPaymentBtn.addEventListener('click', async () => {
        const name = checkoutName.value.trim();
        const email = checkoutEmail.value.trim();
        
        if (!name || !email) {
            alert('Veuillez renseigner votre nom et email.');
            openCheckoutStep(1);
            return;
        }

        const isTwint = payTwintCard.classList.contains('active');
        const paymentMethod = isTwint ? 'TWINT' : 'Carte de Crédit';

        confirmPaymentBtn.disabled = true;

        if (isTwint) {
            confirmPaymentBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Attente confirmation TWINT...`;
            
            // Simulate TWINT push notification authorization for 3 seconds
            setTimeout(async () => {
                const orderData = {
                    name,
                    email,
                    paymentMethod,
                    items: appState.cart.map(i => ({ categoryId: i.categoryId, quantity: i.quantity }))
                };

                try {
                    const res = await fetch(API_URLS.purchase, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    });

                    const data = await res.json();
                    if (data.success) {
                        finalizeCheckout(data.order, name);
                    } else {
                        alert(`Erreur : ${data.error}`);
                        resetConfirmBtn();
                    }
                } catch (e) {
                    console.error(e);
                    alert(`Erreur lors du traitement du paiement.`);
                    resetConfirmBtn();
                }
            }, 3000);

        } else {
            // Credit Card checkout
            if (!validateCardForm()) {
                confirmPaymentBtn.disabled = false;
                return;
            }

            confirmPaymentBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Traitement...`;
            
            const cardVal = cardNum.value;
            const brand = getCardBrand(cardVal);
            const maskedCard = '**** **** **** ' + cardVal.replace(/\s/g, '').slice(-4);

            pendingPurchaseData = {
                name,
                email,
                paymentMethod,
                cardBrand: brand.toUpperCase(),
                cardNumberMasked: maskedCard,
                items: appState.cart.map(i => ({ categoryId: i.categoryId, quantity: i.quantity }))
            };

            // Set amount in 3DS modal
            const totalStr = cartTotalPrice.innerText;
            secure3dsModal.querySelectorAll('.checkout-total-val').forEach(el => {
                el.innerText = totalStr;
            });

            // Open 3DS Modal
            secure3dsModal.classList.add('open');
            secure3dsLoading.classList.remove('d-none');
            secure3dsOtp.classList.add('d-none');
            secure3dsError.style.display = 'none';
            secure3dsOtpField.value = '';

            // Simulate bank handshake for 1.5 seconds
            setTimeout(() => {
                secure3dsLoading.classList.add('d-none');
                secure3dsOtp.classList.remove('d-none');
                
                // Generate and display simulated 3DS SMS code
                current3dsCode = Math.floor(100000 + Math.random() * 900000).toString();
                demo3dsCode.innerText = current3dsCode;
                secure3dsOtpField.focus();
            }, 1500);
        }
    });

    function resetConfirmBtn() {
        confirmPaymentBtn.disabled = false;
        confirmPaymentBtn.innerText = `Confirmer et Payer`;
    }

    async function finalizeCheckout(order, name) {
        // Populate Printable receipt
        receiptTicketName.innerText = appState.cart.map(i => `${i.quantity}x ${i.name}`).join(' + ');
        receiptHolderName.innerText = name;
        receiptOrderId.innerText = order.id;

        // Sync new tickets stock from server
        await fetchTickets();

        // Clear cart & input values
        appState.cart = [];
        updateCartUI();
        
        cardNum.value = '';
        cardExp.value = '';
        cardCvc.value = '';
        updateCardBrandIcon('unknown');

        // Go to step 3 success screen
        resetConfirmBtn();
        openCheckoutStep(3);
    }

    // 3D Secure Form Verification
    secure3dsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = secure3dsOtpField.value.trim();

        if (code === current3dsCode) {
            secure3dsModal.classList.remove('open');
            confirmPaymentBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Finalisation...`;

            try {
                const res = await fetch(API_URLS.purchase, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pendingPurchaseData)
                });

                const data = await res.json();
                if (data.success) {
                    finalizeCheckout(data.order, pendingPurchaseData.name);
                } else {
                    alert(`Erreur : ${data.error}`);
                    resetConfirmBtn();
                }
            } catch (err) {
                console.error(err);
                alert(`Erreur lors de la finalisation.`);
                resetConfirmBtn();
            }
        } else {
            secure3dsError.style.display = 'block';
            secure3dsOtpField.classList.add('invalid');
            setTimeout(() => {
                secure3dsOtpField.classList.remove('invalid');
            }, 500);
        }
    });

    // Cancel 3D Secure
    cancel3dsBtn.addEventListener('click', () => {
        secure3dsModal.classList.remove('open');
        resetConfirmBtn();
    });

    finishCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
    });

    // ==========================================
    // BACK-OFFICE / ADMIN PORTAL & 2FA CONTROLS
    // ==========================================
    
    adminPortalBtn.addEventListener('click', () => {
        if (appState.adminToken) {
            // Admin already authenticated
            adminFullOverlay.classList.add('open');
            showAdminDashboard();
        } else {
            // Direct to auth screens
            adminFullOverlay.classList.add('open');
            showAdminAuthView('login');
        }
    });

    closeAdminOverlayBtn.addEventListener('click', () => {
        adminFullOverlay.classList.remove('open');
    });

    function showAdminAuthView(view) {
        adminLoginView.classList.remove('active');
        admin2FAView.classList.remove('active');
        adminDashboardView.classList.remove('active');

        if (view === 'login') {
            adminLoginView.classList.add('active');
        } else if (view === '2fa') {
            admin2FAView.classList.add('active');
        } else if (view === 'dashboard') {
            adminDashboardView.classList.add('active');
        }
    }

    // Step 1: Admin credentials submission
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = adminEmailField.value;
        const password = adminPasswordField.value;

        try {
            const res = await fetch(API_URLS.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (data.success && data.requires2FA) {
                appState.twoFactorEmail = email;
                demo2FACodePlaceholder.innerText = data.demoCode;
                showAdminAuthView('2fa');
                otpDigitField.focus();
            } else {
                alert(`Erreur : ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert('Échec de la connexion.');
        }
    });

    backToLoginBtn.addEventListener('click', () => showAdminAuthView('login'));

    // Step 2: 2FA Verification
    admin2FAForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = otpDigitField.value;

        try {
            const res = await fetch(API_URLS.verify2FA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: appState.twoFactorEmail, code })
            });

            const data = await res.json();
            if (data.success) {
                appState.adminUser = data.user;
                appState.adminToken = data.token;
                
                // Save session in local state
                showAdminDashboard();
            } else {
                alert(`Code 2FA incorrect.`);
            }
        } catch (err) {
            console.error(err);
            alert('Échec de validation 2FA.');
        }
    });

    // Logout
    adminLogoutBtn.addEventListener('click', () => {
        appState.adminUser = null;
        appState.adminToken = null;
        otpDigitField.value = '';
        showAdminAuthView('login');
    });

    // Loaded inside active session
    async function showAdminDashboard() {
        showAdminAuthView('dashboard');
        await loadAdminFinancials();
        await renderAdminTicketsTable();
        await renderAdminOrdersTable();
        await renderAdminMatchesControl();
    }

    // Admin Tabs Swapping
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 1. Fetch and render financial goals
    async function loadAdminFinancials() {
        try {
            const res = await fetch(API_URLS.adminFinancials);
            const data = await res.json();
            
            // Target progress calculations
            financialValCurrent.innerText = `CHF ${data.totalRevenue.toLocaleString('fr-CH', { minimumFractionDigits: 2 })}`;
            financialTicketsShare.innerText = `Billetterie: CHF ${data.ticketRevenue.toLocaleString('fr-CH')}`;
            financialSponsorsShare.innerText = `Sponsors: CHF ${data.sponsorships.toLocaleString('fr-CH')}`;
            statTicketsSold.innerText = `${data.ticketsSold} / ${data.totalTickets}`;

            // Calculate progress percent (minimum goal is CHF 90K, max is CHF 110K, target mid 100K)
            const pct = Math.min(Math.round((data.totalRevenue / 100000) * 100), 100);
            financialProgressBar.style.width = `${pct}%`;
        } catch (e) {
            console.error(e);
        }
    }

    // 2. Render Tickets Table inside back-office
    function renderAdminTicketsTable() {
        adminTicketsTableBody.innerHTML = '';
        appState.tickets.forEach(ticket => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ticket.name}</strong></td>
                <td><small>${ticket.description}</small></td>
                <td>${ticket.price.toFixed(2)} CHF</td>
                <td>${ticket.total}</td>
                <td>${ticket.available}</td>
                <td>
                    <button class="btn btn-outline btn-sm edit-ticket-btn" data-id="${ticket.id}"><i class="fa-solid fa-pen-to-square"></i> Modifier</button>
                </td>
            `;

            tr.querySelector('.edit-ticket-btn').addEventListener('click', () => {
                openTicketEditor(ticket.id);
            });

            adminTicketsTableBody.appendChild(tr);
        });
    }

    // 3. Render orders table inside back-office
    async function renderAdminOrdersTable() {
        try {
            const res = await fetch(API_URLS.adminOrders);
            const orders = await res.json();
            
            adminOrdersTableBody.innerHTML = '';
            orders.forEach(order => {
                const tr = document.createElement('tr');
                const itemsStr = order.items.map(i => `${i.quantity}x ${i.name}`).join('<br>');
                
                tr.innerHTML = `
                    <td><code>${order.id}</code></td>
                    <td>${order.name}</td>
                    <td>${order.email}</td>
                    <td><small>${itemsStr}</small></td>
                    <td>${order.method}</td>
                    <td><strong>${order.total.toFixed(2)} CHF</strong></td>
                    <td><span class="badge-status paid">${order.status}</span></td>
                `;
                adminOrdersTableBody.appendChild(tr);
            });
        } catch (e) {
            console.error(e);
        }
    }

    // 4. Render matches controllers inside back-office
    function renderAdminMatchesControl() {
        adminMatchesControlContainer.innerHTML = '';
        appState.matches.forEach(match => {
            const div = document.createElement('div');
            div.className = 'admin-match-control-card';
            
            const isLive = match.status === 'live';
            const isCompleted = match.status === 'completed';
            const isScheduled = match.status === 'scheduled';

            div.innerHTML = `
                <div class="control-card-header">
                    <h4>${match.stage}</h4>
                    <span class="badge-status ${match.status}">${match.status.toUpperCase()}</span>
                </div>

                <div class="control-score-row">
                    <div class="control-team">
                        <span class="logo">${match.teamA.logo}</span>
                        <span class="name">${match.teamA.name}</span>
                    </div>

                    <div class="control-score-inputs">
                        <button class="score-adjust-btn dec-a">-</button>
                        <span class="control-score-val score-a-val">${match.scoreA}</span>
                        <button class="score-adjust-btn inc-a">+</button>
                        
                        <span class="text-muted">:</span>
                        
                        <button class="score-adjust-btn dec-b">-</button>
                        <span class="control-score-val score-b-val">${match.scoreB}</span>
                        <button class="score-adjust-btn inc-b">+</button>
                    </div>

                    <div class="control-team">
                        <span class="logo">${match.teamB.logo}</span>
                        <span class="name">${match.teamB.name}</span>
                    </div>
                </div>

                <form class="control-form">
                    <div class="form-group">
                        <label>Statut</label>
                        <select class="status-select-field" style="background:var(--bg-input); border:1px solid var(--border-color); color:white; padding:10px; border-radius:6px;">
                            <option value="scheduled" ${isScheduled ? 'selected' : ''}>Planifié</option>
                            <option value="live" ${isLive ? 'selected' : ''}>En Direct</option>
                            <option value="completed" ${isCompleted ? 'selected' : ''}>Terminé</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Ajouter un Log de Round</label>
                        <input type="text" class="log-input-field" placeholder="Ex: ZywOo double-kill en zone A">
                    </div>
                    
                    <div class="form-group">
                        <label>Condition de Victoire (Log)</label>
                        <select class="condition-select-field" style="background:var(--bg-input); border:1px solid var(--border-color); color:white; padding:10px; border-radius:6px;">
                            <option value="elimination">Élimination des adversaires</option>
                            <option value="defusal">Désamorçage du Spike</option>
                            <option value="explosion">Explosion du Spike</option>
                        </select>
                    </div>

                    <div class="control-actions-row">
                        <button type="button" class="btn btn-outline update-score-btn">Mettre à Jour</button>
                        <button type="button" class="btn btn-primary add-log-btn">Log & Save</button>
                    </div>
                </form>
            `;

            // DOM inputs selectors inside card
            const scoreAVal = div.querySelector('.score-a-val');
            const scoreBVal = div.querySelector('.score-b-val');
            const statusSelect = div.querySelector('.status-select-field');
            const logInput = div.querySelector('.log-input-field');
            const conditionSelect = div.querySelector('.condition-select-field');

            let tempScoreA = match.scoreA;
            let tempScoreB = match.scoreB;

            // Increment/Decrement handlers
            div.querySelector('.dec-a').addEventListener('click', () => { if (tempScoreA > 0) tempScoreA--; scoreAVal.innerText = tempScoreA; });
            div.querySelector('.inc-a').addEventListener('click', () => { tempScoreA++; scoreAVal.innerText = tempScoreA; });
            div.querySelector('.dec-b').addEventListener('click', () => { if (tempScoreB > 0) tempScoreB--; scoreBVal.innerText = tempScoreB; });
            div.querySelector('.inc-b').addEventListener('click', () => { tempScoreB++; scoreBVal.innerText = tempScoreB; });

            // API submission helper
            const submitMatchChanges = async (includeLog = false) => {
                const payload = {
                    scoreA: tempScoreA,
                    scoreB: tempScoreB,
                    status: statusSelect.value
                };

                if (payload.status === 'completed') {
                    payload.winner = tempScoreA > tempScoreB ? match.teamA.name : match.teamB.name;
                } else {
                    payload.winner = null;
                }

                if (includeLog && logInput.value.trim()) {
                    payload.logText = logInput.value.trim();
                    payload.logCondition = conditionSelect.value;
                }

                try {
                    const res = await fetch(`/api/matches/${match.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await res.json();
                    if (result.success) {
                        logInput.value = ''; // clear log field
                        await fetchMatches(); // reload details
                        await loadAdminFinancials(); // sync totals if any
                    }
                } catch (e) {
                    console.error(e);
                    alert('Erreur lors de la mise à jour.');
                }
            };

            div.querySelector('.update-score-btn').addEventListener('click', () => submitMatchChanges(false));
            div.querySelector('.add-log-btn').addEventListener('click', () => submitMatchChanges(true));

            adminMatchesControlContainer.appendChild(div);
        });
    }

    // ==========================================
    // TICKET PRODUCT EDITOR MODAL
    // ==========================================
    
    function openTicketEditor(id) {
        const ticket = appState.tickets.find(t => t.id === id);
        if (!ticket) return;

        editTicketId.value = ticket.id;
        editTicketName.value = ticket.name;
        editTicketDesc.value = ticket.description;
        editTicketPrice.value = ticket.price;
        editTicketTotal.value = ticket.total;
        editTicketAvail.value = ticket.available;

        ticketEditModal.classList.add('open');
    }

    closeTicketEditModal.addEventListener('click', () => {
        ticketEditModal.classList.remove('open');
    });

    ticketEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = parseInt(editTicketId.value);
        const name = editTicketName.value;
        const description = editTicketDesc.value;
        const price = parseFloat(editTicketPrice.value);
        const total = parseInt(editTicketTotal.value);
        const available = parseInt(editTicketAvail.value);

        try {
            const res = await fetch(API_URLS.adminTicketsUpdate(id), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price, total, available })
            });

            const data = await res.json();
            if (data.success) {
                ticketEditModal.classList.remove('open');
                await fetchTickets(); // Refresh lists
                await loadAdminFinancials(); // Sync progress bars
            } else {
                alert('Erreur de mise à jour.');
            }
        } catch (err) {
            console.error(err);
            alert('Échec de la sauvegarde.');
        }
    });

    // --- RUN ENTRY ---
    initApp();
});
