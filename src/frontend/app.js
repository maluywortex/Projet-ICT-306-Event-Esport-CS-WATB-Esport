/* ==========================================================================
   EVENT CS 2026 — CLIENT APPLICATION CODE
   Handles SPA routes, cart operations, multi-step payments, bracket views,
   real-time score polling, and secure back-office admin controls.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

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

    // Confirm Payment
    confirmPaymentBtn.addEventListener('click', async () => {
        const name = checkoutName.value;
        const email = checkoutEmail.value;
        const isTwint = payTwintCard.classList.contains('active');
        const paymentMethod = isTwint ? 'TWINT' : 'Carte de Crédit';

        const orderData = {
            name,
            email,
            paymentMethod,
            items: appState.cart.map(i => ({ categoryId: i.categoryId, quantity: i.quantity }))
        };

        confirmPaymentBtn.disabled = true;
        confirmPaymentBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Traitement...`;

        try {
            const res = await fetch(API_URLS.purchase, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (data.success) {
                // Populate Printable receipt
                receiptTicketName.innerText = appState.cart.map(i => `${i.quantity}x ${i.name}`).join(' + ');
                receiptHolderName.innerText = name;
                receiptOrderId.innerText = data.order.id;

                // Sync new tickets stock from server
                await fetchTickets();

                // Clear cart
                appState.cart = [];
                updateCartUI();

                // Go to step 3 success screen
                openCheckoutStep(3);
            } else {
                alert(`Erreur : ${data.error}`);
            }
        } catch (e) {
            console.error(e);
            alert(`Erreur lors du traitement du paiement.`);
        } finally {
            confirmPaymentBtn.disabled = false;
            confirmPaymentBtn.innerText = `Confirmer et Payer`;
        }
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
    // PARKING MAP INITIALIZATION
    // ==========================================
    
    function initParkingMap() {
        // La Marive coordinates (Yverdon-les-Bains)
        const laMativeCoords = [46.7812, 6.6438];
        
        // Initialize Leaflet map
        const parkingMap = L.map('parking-map').setView(laMativeCoords, 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(parkingMap);
        
        // Parking locations data
        const parkingLocations = [
            {
                name: 'La Marive - Parking Principal',
                coords: [46.7812, 6.6438],
                spaces: 350,
                type: 'main',
                id: 'parking-main'
            },
            {
                name: 'Centre Dortaux - Parking Secondaire',
                coords: [46.7745, 6.6395],
                spaces: 280,
                type: 'secondary',
                id: 'parking-secondary'
            }
        ];
        
        // Add markers for each parking
        parkingLocations.forEach(parking => {
            const markerColor = parking.type === 'main' ? '#a855f7' : '#06b6d4';
            const markerIcon = L.divIcon({
                className: 'parking-marker',
                html: `<i class="fa-solid fa-${parking.type === 'main' ? 'location-dot' : 'parking'}"></i>`,
                iconSize: [40, 40]
            });
            
            const marker = L.marker(parking.coords, { icon: markerIcon }).addTo(parkingMap);
            
            const popupContent = `
                <div style="width: 250px;">
                    <h4 style="margin: 0 0 10px 0; color: #a855f7; font-family: 'Orbitron', sans-serif;">${parking.name}</h4>
                    <div style="font-size: 0.9rem; color: #f3e8ff;">
                        <p><i class="fa-solid fa-square-parking" style="color: #a855f7;"></i> <strong>${parking.spaces} places</strong> disponibles</p>
                        <p><i class="fa-solid fa-info-circle" style="color: #06b6d4;"></i> Gratuit le jour de l'événement</p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
        });
        
        // Update parking availability status
        updateParkingStatus();
        
        // Simulate real-time updates every 30 seconds
        setInterval(updateParkingStatus, 30000);
    }
    
    function updateParkingStatus() {
        // Simulate parking availability changes (in real scenario, would fetch from API)
        const mainParking = document.getElementById('parking-block-main');
        const secondaryParking = document.getElementById('parking-block-secondary');
        
        if (!mainParking || !secondaryParking) return;
        
        // Simulate availability percentages
        const mainSpaces = Math.floor(Math.random() * (350 - 50) + 50); // 50-350
        const secondarySpaces = Math.floor(Math.random() * (280 - 40) + 40); // 40-280
        
        // Update main parking
        document.getElementById('parking-spaces-main').innerText = `${mainSpaces} places disponibles`;
        const mainStatus = mainParking.querySelector('.parking-status');
        mainParking.querySelector('.parking-header').classList.add('updated');
        
        if (mainSpaces < 30) {
            mainStatus.className = 'parking-status full';
            mainStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Complet</span>';
        } else if (mainSpaces < 100) {
            mainStatus.className = 'parking-status limited';
            mainStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Places Limitées</span>';
        } else {
            mainStatus.className = 'parking-status available';
            mainStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Places Disponibles</span>';
        }
        
        // Update secondary parking
        document.getElementById('parking-spaces-secondary').innerText = `${secondarySpaces} places disponibles`;
        const secondaryStatus = secondaryParking.querySelector('.parking-status');
        secondaryParking.querySelector('.parking-header').classList.add('updated');
        
        if (secondarySpaces < 20) {
            secondaryStatus.className = 'parking-status full';
            secondaryStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Complet</span>';
        } else if (secondarySpaces < 80) {
            secondaryStatus.className = 'parking-status limited';
            secondaryStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Places Limitées</span>';
        } else {
            secondaryStatus.className = 'parking-status available';
            secondaryStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Places Disponibles</span>';
        }
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
    initParkingMap();
});
