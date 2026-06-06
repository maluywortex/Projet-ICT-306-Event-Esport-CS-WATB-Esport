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

    window.addEventListener('scroll', updateActiveNavLinkOnScroll, { passive: true });
    window.addEventListener('hashchange', activateNavByHash);
}

window.addEventListener('DOMContentLoaded', () => {
    renderCart();
    attachEvents();
    activateNavByHash();
});
