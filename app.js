/**
 * Ateliê Dolce & Brigadeiro - Core Engine
 * Versão: 5.0.2 (Blindagem Total do Carregamento do QRCode)
 */

const DATA_PRODUCTS = [
    {
        id: "b-01",
        title: "Negrinho (Tradicional)",
        description: "O clássico brigadeiro de chocolate, feito com granulado macio e massa ultra cremosa.",
        price: 2.50,
        image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-02",
        title: "Beijinho",
        description: "Deliciosa combinação de leite condensado com coco ralado fresco, finalizado com açúcar cristal.",
        price: 3.00,
        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-03",
        title: "Maracujá",
        description: "Brigadeiro gourmet com o toque azedinho e refrescante do fruto puro do maracujá.",
        price: 3.50,
        image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-04",
        title: "Churros",
        description: "Massa leve de canela recheada com doce de leite artesanal premium e crosta de açúcar.",
        price: 3.50,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-05",
        title: "Ninho com Nutella",
        description: "Nossa massa especial de Leite Ninho envolvendo um recheio generoso de creme de avelã puro.",
        price: 4.00,
        image: "https://images.unsplash.com/photo-1516685018646-549198525c1b?auto=format&fit=crop&w=600&q=80"
    }
];

const WHATSAPP_PHONE = "5551989445101";

let stateCart = {};

const domProductsGrid = document.getElementById('productsGrid');
const domCartTrigger = document.getElementById('cartTrigger');
const domCartBadge = document.getElementById('cartBadge');
const domCartDrawer = document.getElementById('cartDrawer');
const domCartOverlay = document.getElementById('cartOverlay');
const domCloseCartBtn = document.getElementById('closeCartBtn');
const domCartDrawerItems = document.getElementById('cartDrawerItems');
const domCartTotal = document.getElementById('cartTotal');
const domCheckoutBtn = document.getElementById('checkoutBtn');
const domPaymentModalOverlay = document.getElementById('paymentModalOverlay');
const domCloseModalBtn = document.getElementById('closeModalBtn');
const domPaymentSelectionScreen = document.getElementById('paymentSelectionScreen');
const domPaymentPixScreen = document.getElementById('paymentPixScreen');
const domPixModalTotal = document.getElementById('pixModalTotal');
const domQrcodeContainer = document.getElementById('qrcodeContainer');

function initializeApp() {
    if (domProductsGrid) {
        domProductsGrid.innerHTML = DATA_PRODUCTS.map(product => `
            <article class="product-card">
                <div class="product-image-wrapper">
                    <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                </div>
                <div class="product-meta">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <span class="product-info-promo">Lote de 5 unidades com 20% OFF</span>
                    <div class="product-footer">
                        <span class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')} <small>/un</small></span>
                        <button class="btn-add-cart" onclick="addProductToCart('${product.id}')">Adicionar</button>
                    </div>
                </div>
            </article>
        `).join('');
    }
    updateCartUI();
}

window.addProductToCart = function(id) {
    stateCart[id] = (stateCart[id] || 0) + 1;
    updateCartUI();
    openDrawer();
};

window.removeProductFromCart = function(id) {
    if (stateCart[id]) {
        stateCart[id]--;
        if (stateCart[id] === 0) delete stateCart[id];
        updateCartUI();
    }
};

function openDrawer() {
    if(domCartDrawer) domCartDrawer.classList.add('active');
    if(domCartOverlay) domCartOverlay.classList.add('active');
    if(domCartDrawer) domCartDrawer.setAttribute('aria-hidden', 'false');
}

function toggleDrawerVisibility() {
    if(domCartDrawer) {
        const isActive = domCartDrawer.classList.toggle('active');
        if(domCartOverlay) domCartOverlay.classList.toggle('active', isActive);
        domCartDrawer.setAttribute('aria-hidden', !isActive);
    }
}

function calculateCartTotals() {
    let subtotal = 0;
    let totalDiscount = 0;

    Object.keys(stateCart).forEach(id => {
        const prod = DATA_PRODUCTS.find(p => p.id === id);
        if (prod) {
            const qty = stateCart[id];
            const itemSubtotal = prod.price * qty;
            subtotal += itemSubtotal;

            const baseLots = Math.floor(qty / 5);
            if (baseLots > 0) {
                const discountPerLot = (prod.price * 5) * 0.20;
                totalDiscount += baseLots * discountPerLot;
            }
        }
    });

    return {
        subtotal: subtotal,
        discount: totalDiscount,
        total: Math.max(0, subtotal - totalDiscount)
    };
}

function updateCartUI() {
    const totals = calculateCartTotals();
    let totalItems = 0;

    if (domCartDrawerItems) {
        const keys = Object.keys(stateCart);
        if (keys.length === 0) {
            domCartDrawerItems.innerHTML = `<p class="cart-empty-message">Seu carrinho está vazio.</p>`;
        } else {
            domCartDrawerItems.innerHTML = keys.map(id => {
                const prod = DATA_PRODUCTS.find(p => p.id === id);
                const qty = stateCart[id];
                totalItems += qty;
                return `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4>${prod.title}</h4>
                            <p>R$ ${prod.price.toFixed(2).replace('.', ',')} /un</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="qty-stepper">
                                <button onclick="removeProductFromCart('${prod.id}')">-</button>
                                <span>${qty}</span>
                                <button onclick="addProductToCart('${prod.id}')">+</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    if (domCartBadge) domCartBadge.textContent = totalItems;
    if (domCartTotal) {
        if (totals.discount > 0) {
            domCartTotal.innerHTML = `
                <div style="font-size:0.9rem; color:var(--color-text-muted); text-decoration:line-through;">Subtotal: R$ ${totals.subtotal.toFixed(2).replace('.', ',')}</div>
                <div style="font-size:0.9rem; color:#2d7a3a; font-weight:600;">Desconto Lote: -R$ ${totals.discount.toFixed(2).replace('.', ',')}</div>
                <div style="margin-top:5px;">Total: R$ ${totals.total.toFixed(2).replace('.', ',')}</div>
            `;
        } else {
            domCartTotal.textContent = `R$ ${totals.total.toFixed(2).replace('.', ',')}`;
        }
    }
    
    if (domCheckoutBtn) {
        domCheckoutBtn.disabled = totalItems === 0;
    }
}

/**
 * LÓGICA DO MEIO DE PAGAMENTO & EMISSÃO DE PIX DINÂMICO REAL
 */
const PaymentFlow = {
    currentPixCode: "",

    openModal() {
        if(domPaymentModalOverlay) domPaymentModalOverlay.classList.add('active');
        if(domPaymentSelectionScreen) domPaymentSelectionScreen.style.display = 'flex';
        if(domPaymentPixScreen) domPaymentPixScreen.style.display = 'none';
        toggleDrawerVisibility();
    },

    closeModal() {
        if(domPaymentModalOverlay) domPaymentModalOverlay.classList.remove('active');
    },

    selectPix() {
        const totals = calculateCartTotals();
        if(domPaymentSelectionScreen) domPaymentSelectionScreen.style.display = 'none';
        if(domPaymentPixScreen) domPaymentPixScreen.style.display = 'block';
        if(domPixModalTotal) domPixModalTotal.textContent = `R$ ${totals.total.toFixed(2).replace('.', ',')}`;

        // Limpa o contêiner do QR Code antigo antes de renderizar
        if(domQrcodeContainer) domQrcodeContainer.innerHTML = "";

        // Formatação do valor para duas casas decimais com ponto (ex: "12.50")
        const formattedValueStr = totals.total.toFixed(2);

        // Montagem do payload dinâmico BR Code baseado na especificação do Banco Central
        // Chave Pix utilizada: 51989445101 (Formato Nacional sem o +55)
        const pixKey = "51989445101"; 
        const merchantName = "DOLCE BRIGADEIRO";
        const merchantCity = "PORTO ALEGRE";

        // Geração da string estática com valor embutido (Campos obrigatórios EMV)
        const part1 = "00020101021226330014br.gov.bcb.pix0111" + pixKey;
        const part2 = "52040000530398654" + formattedValueStr.length.toString().padStart(2, '0') + formattedValueStr + "5802BR5915" + merchantName + "6013" + merchantCity + "62070503***6304";
        
        // Algoritmo de checagem CRC16 CCITT
        const fullPayloadWithoutCrc = part1 + part2;
        const crcValue = PaymentFlow.calculateCRC16(fullPayloadWithoutCrc);
        
        // Código completo Copia e Cola definitivo com valor real acoplado
        this.currentPixCode = fullPayloadWithoutCrc + crcValue;

        // Renderização dinâmica e nativa do QR Code em tela utilizando o Script qrcode.min.js
        if (typeof QRCode !== "undefined" && domQrcodeContainer) {
            new QRCode(domQrcodeContainer, {
                text: this.currentPixCode,
                width: 200,
                height: 200,
                colorDark: "#261c14",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    },

    calculateCRC16(str) {
        let crc = 0xFFFF;
        for (let i = 0; i < str.length; i++) {
            let b = str.charCodeAt(i);
            for (let j = 0; j < 8; j++) {
                let bit = ((b >> (7 - j)) & 1) === 1;
                let c15 = ((crc >> 15) & 1) === 1;
                crc <<= 1;
                if (c15 ^ bit) crc ^= 0x1021;
            }
        }
        crc = crc & 0xFFFF;
        return crc.toString(16).toUpperCase().padStart(4, '0');
    },

    getCartSummaryText() {
        return Object.keys(stateCart).map(id => {
            const prod = DATA_PRODUCTS.find(p => p.id === id);
            return `• ${stateCart[id]}x ${prod.title} (R$ ${(prod.price * stateCart[id]).toFixed(2).replace('.', ',')})`;
        }).join('\n');
    },

    finishWithPix() {
        const totals = calculateCartTotals();
        let message = `Olá! Realizei o meu pedido no Ateliê Dolce & Brigadeiro:\n\n`;
        message += `${this.getCartSummaryText()}\n\n`;
        if (totals.discount > 0) {
            message += `*Desconto Aplicado:* R$ ${totals.discount.toFixed(2).replace('.', ',')}\n`;
        }
        message += `*Total Final:* R$ ${totals.total.toFixed(2).replace('.', ',')}\n\n`;
        message += `*Forma de Pagamento:* PIX já efetuado via QR Code!\n`;
        message += `Seguirá em anexo o comprovante da transferência bancária.`;
        this.dispatchWhatsApp(message);
    },

    finishWithCombinar() {
        const totals = calculateCartTotals();
        let message = `Olá! Montei meu carrinho no Ateliê Dolce & Brigadeiro e gostaria de combinar o pagamento:\n\n`;
        message += `${this.getCartSummaryText()}\n\n`;
        message += `*Total Estimado:* R$ ${totals.total.toFixed(2).replace('.', ',')}\n\n`;
        message += `*Forma de Pagamento:* A acertar direto com a confeiteira.`;
        message += `\nGostaria de combinar a entrega/retirada e definir como pagar!`;
        this.dispatchWhatsApp(message);
    },

    dispatchWhatsApp(message) {
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, '_blank');
        this.closeModal();
    }
};

if(domCartTrigger) domCartTrigger.addEventListener('click', toggleDrawerVisibility);
if(domCloseCartBtn) domCloseCartBtn.addEventListener('click', toggleDrawerVisibility);
if(domCartOverlay) domCartOverlay.addEventListener('click', toggleDrawerVisibility);
if(domCheckoutBtn) domCheckoutBtn.addEventListener('click', PaymentFlow.openModal);
if(domCloseModalBtn) domCloseModalBtn.addEventListener('click', PaymentFlow.closeModal);

const btnCopyPix = document.getElementById('btnCopyPix');
if(btnCopyPix) {
    btnCopyPix.addEventListener('click', () => {
        if(!PaymentFlow.currentPixCode) return;
        navigator.clipboard.writeText(PaymentFlow.currentPixCode).then(() => {
            alert("Código PIX Copia e Cola copiado com sucesso!");
        }).catch(() => {
            alert("Erro ao copiar automaticamente. Por favor, utilize o QR Code.");
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
