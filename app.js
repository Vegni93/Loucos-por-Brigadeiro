/**
 * Ateliê Dolce & Brigadeiro - Core Engine
 * Versão: 5.0.0 (Completo: Cardápio + Descontos + PIX Dinâmico com Preço Travado Real)
 */

// 1. Banco de Dados Oficial de Produtos (Model)
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
        price: 4.00,
        image: "https://images.unsplash.com/photo-1575549594211-8f3764e1011d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-04",
        title: "Sem Lactose",
        description: "Todo o sabor e cremosidade do brigadeiro tradicional em uma receita 100% livre de lactose.",
        price: 4.50,
        image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: "b-05",
        title: "Não Diabético (Gourmet Nobre)",
        description: "Nossa linha tradicional premium feita com açúcar orgânico e blend de chocolates nobres.",
        price: 5.50,
        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80"
    }
];

// 2. Configurações Reais de Produção (Chave PIX e Contato)
const CONFIG_PIX = {
    chave: "60069012008",       // Sua chave PIX real (CPF)
    beneficiario: "JULIA DOCES", // Seu nome comercial (Sem acentos, máx 25 letras)
    cidade: "PORTO ALEGRE"       // Sua cidade (Sem acentos, máx 15 letras)
};
const WHATSAPP_PHONE = "5551989412241"; // Seu WhatsApp de atendimento configurado

// 3. Gerenciador de Estado Interno (State Manager)
const AppState = {
    cart: [],
    
    addItem(productId) {
        const itemExistente = this.cart.find(item => item.id === productId);
        if (itemExistente) {
            itemExistente.quantity++;
        } else {
            const produtoOriginal = DATA_PRODUCTS.find(p => p.id === productId);
            if (produtoOriginal) {
                this.cart.push({ ...produtoOriginal, quantity: 1 });
            }
        }
        this.syncRender();
    },

    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.syncRender();
    },

    calculateItemSubtotal(item) {
        const blocosDeCinco = Math.floor(item.quantity / 5);
        const restante = item.quantity % 5;
        const precoComDesconto = item.price * 0.8; // 20% de desconto
        
        return (blocosDeCinco * 5 * precoComDesconto) + (restante * item.price);
    },

    get totalItems() {
        return this.cart.reduce((acc, item) => acc + item.quantity, 0);
    },
    
    get totalPrice() {
        return this.cart.reduce((acc, item) => acc + this.calculateItemSubtotal(item), 0);
    },

    syncRender() {
        renderCartUI();
    }
};

// 4. Mapeamento de Elementos do DOM
const domProductsGrid = document.getElementById('productsGrid');
const domCartDrawer = document.getElementById('cartDrawer');
const domCartOverlay = document.getElementById('cartOverlay');
const domCartTrigger = document.getElementById('cartTrigger');
const domCloseCartBtn = document.getElementById('closeCartBtn');
const domCartItemsContainer = document.getElementById('cartDrawerItems');
const domCartTotal = document.getElementById('cartTotal');
const domCartBadge = document.getElementById('cartBadge');
const domCheckoutBtn = document.getElementById('checkoutBtn');

const domPaymentModalOverlay = document.getElementById('paymentModalOverlay');
const domCloseModalBtn = document.getElementById('closeModalBtn');
const domPaymentSelectionScreen = document.getElementById('paymentSelectionScreen');
const domPaymentPixScreen = document.getElementById('paymentPixScreen');
const domPixModalTotal = document.getElementById('pixModalTotal');

// 5. Funções de Renderização da Interface (UI)
function initProductsGrid() {
    if(!domProductsGrid) return;
    domProductsGrid.innerHTML = DATA_PRODUCTS.map(product => `
        <article class="product-card">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            </div>
            <div class="product-meta">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-info-promo">A cada 5 unidades ganhe 20% de desconto!</div>
                <div class="product-footer">
                    <span class="product-price">R$ ${product.price.toFixed(2)} <small style="font-size:11px; font-weight:normal; color:#6e655f;">/un</small></span>
                    <button class="btn-add-cart" onclick="AppState.addItem('${product.id}')">Selecionar</button>
                </div>
            </div>
        </article>
    `).join('');
}

function renderCartUI() {
    if(domCartBadge) domCartBadge.innerText = AppState.totalItems;
    if(domCartTotal) domCartTotal.innerText = `R$ ${AppState.totalPrice.toFixed(2)}`;
    if(!domCartItemsContainer) return;

    if (AppState.cart.length === 0) {
        domCartItemsContainer.innerHTML = `<p style="text-align:center; color:#6e655f; margin-top:20px;">Seu carrinho está vazio.</p>`;
        return;
    }

    domCartItemsContainer.innerHTML = AppState.cart.map(item => {
        const subtotalItem = AppState.calculateItemSubtotal(item);
        const temDesconto = item.quantity >= 5;

        return `
            <div class="cart-render-item">
                <div class="cri-details">
                    <h4>${item.title}</h4>
                    <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
                    ${temDesconto ? `<small style="color: #2e7d32; font-weight: 600;">✓ Desconto de 20% aplicado</small>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <strong>R$ ${subtotalItem.toFixed(2)}</strong>
                    <button class="cri-remove" onclick="AppState.removeItem('${item.id}')">Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleDrawerVisibility() {
    if(domCartDrawer && domCartOverlay) {
        domCartDrawer.classList.toggle('active');
        domCartOverlay.classList.toggle('active');
    }
}

// 6. Mecanismo de Pagamento e Integração BR Code com Preço Travado
const PaymentFlow = {
    currentPixCode: "",

    openModal() {
        if (AppState.cart.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }
        if(domCartDrawer) domCartDrawer.classList.remove('active');
        if(domCartOverlay) domCartOverlay.classList.remove('active');
        
        if(domPaymentSelectionScreen && domPaymentPixScreen && domPaymentModalOverlay) {
            domPaymentSelectionScreen.style.display = 'block';
            domPaymentPixScreen.style.display = 'none';
            domPaymentModalOverlay.classList.add('active');
        }
    },

    closeModal() {
        if(domPaymentModalOverlay) domPaymentModalOverlay.classList.remove('active');
    },

    selectMethod(method) {
        if (method === 'pix') {
            const totalValue = AppState.totalPrice;
            if(domPixModalTotal) domPixModalTotal.innerText = `R$ ${totalValue.toFixed(2)}`;
            
            // Gera a string oficial EMV do PIX contendo o valor do carrinho e sua chave
            try {
                this.currentPixCode = this.generatePixString(totalValue);
            } catch(e) {
                console.error(e);
                this.currentPixCode = "";
            }
            
            // Renderiza o novo QR Code com os dados em tempo real
            const container = document.getElementById('qrcodeContainer');
            if(container) {
                container.innerHTML = "";
                if (typeof QRCode !== 'undefined' && this.currentPixCode) {
                    new QRCode(container, {
                        text: this.currentPixCode,
                        width: 200,
                        height: 200,
                        colorDark : "#261c14",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.M
                    });
                } else {
                    container.innerHTML = "<p style='color:#a68a62; font-size:12px;'>Use a opção de Copiar Código PIX abaixo.</p>";
                }
            }

            if(domPaymentSelectionScreen && domPaymentPixScreen) {
                domPaymentSelectionScreen.style.display = 'none';
                domPaymentPixScreen.style.display = 'block';
            }
        } else if (method === 'confeiteira') {
            this.finishWithAgreement();
        }
    },

    padSize(val) {
        return String(val).padStart(2, '0');
    },

    generatePixString(value) {
        const valueStr = value.toFixed(2);
        const merchantAccount = "0014BR.GOV.BCB.PIX01" + this.padSize(CONFIG_PIX.chave.length) + CONFIG_PIX.chave;
        const merchantCategory = "52040000";
        const transactionCurrency = "5303986";
        const transactionAmount = "54" + this.padSize(valueStr.length) + valueStr;
        const countryCode = "5802BR";
        const merchantName = "59" + this.padSize(CONFIG_PIX.beneficiario.length) + CONFIG_PIX.beneficiario;
        const merchantCity = "60" + this.padSize(CONFIG_PIX.cidade.length) + CONFIG_PIX.cidade;
        const addDataField = "62070503***";

        let pixPayload = "000201" + "26" + this.padSize(merchantAccount.length) + merchantAccount + merchantCategory + transactionCurrency + transactionAmount + countryCode + merchantName + merchantCity + addDataField + "6304";

        let crc = 0xFFFF;
        for (let i = 0; i < pixPayload.length; i++) {
            crc ^= pixPayload.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
                else crc <<= 1;
            }
        }
        crc = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        
        return pixPayload + crc;
    },

    buildOrderPayload() {
        let text = `*Novo Pedido - Ateliê Dolce & Brigadeiro*\n`;
        text += `-------------------------------------------\n\n`;
        AppState.cart.forEach(item => {
            const subtotal = AppState.calculateItemSubtotal(item);
            text += `• *${item.quantity}x* ${item.title}\n`;
            text += `  Subtotal: R$ ${subtotal.toFixed(2)} ${item.quantity >= 5 ? '(Promoção 5 un. aplicada)' : ''}\n\n`;
        });
        text += `-------------------------------------------\n`;
        text += `*Valor Total: R$ ${AppState.totalPrice.toFixed(2)}*\n`;
        return text;
    },

    finishWithPix() {
        let message = this.buildOrderPayload();
        message += `\n*Forma de Pagamento:* PIX dinâmico efetuado pelo site.`;
        message += `\nEstou enviando o comprovante in anexo aqui no chat!`;
        this.dispatchWhatsApp(message);
    },

    finishWithAgreement() {
        let message = this.buildOrderPayload();
        message += `\n*Forma de Pagamento:* A acertar direto com a confeiteira.`;
        message += `\nGostaria de combinar a entrega/retirada e definir como pagar!`;
        this.dispatchWhatsApp(message);
    },

    dispatchWhatsApp(message) {
        const encoded = encodeURIComponent(message);
        window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, '_blank');
        this.closeModal();
    }
};

// 7. Vinculação de Eventos (Event Listeners)
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

// 8. Inicialização do Sistema
window.addEventListener('DOMContentLoaded', () => {
    initProductsGrid();
    AppState.syncRender();
});