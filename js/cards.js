let cardData = {
    mainServices: [],
    otherServices: [],
    freeServices: []
};

async function loadCardData() {
    try {
        const response = await fetch('/data/services.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);

        if (!Array.isArray(data.services)) {
            throw new Error('data.services is not an array');
        }

        cardData.mainServices = data.services.filter((service) => service.type === 'conciergePaidService');
        cardData.otherServices = data.services.filter((service) => service.type === 'otherConciergePaidService');
        cardData.freeServices = data.services.filter((service) => service.type === 'freeService');
                
        renderCards();
    } catch (error) {
        console.error('Error loading card data:', error);
    }
}

function createCard(card) {
    const priceDisplay = card.type === 'freeService' ? 'Free' : `${card.price.toLocaleString()} yen/per order`;
    
    return `
        <div class="col mt-1 service-card">
            <div class="card border-0 h-100 btn-submit" data-link="payment.html?id=${card.id}" style="cursor: pointer;">
                <img src="${card.image}" class="card-img-top custom-border" alt="${card.title}">
                <div class="card-body">
                    <p class="">${card.title}</p>
                    <h5 class="card-title">${card.japaneseTitle}</h5>
                    <p class="">${priceDisplay}</p>
                    <p class="">${card.description}</p>
                </div>
            </div>
        </div>
    `;
}

function createCardFreeService(card) {
    return `
        <div class="col mt-1 service-card" style="cursor: pointer;">
            <div class="card border-0 h-100 btn-submit" style="cursor: pointer;">
                <img src="${card.image}" class="card-img-top custom-border" alt="${card.title}">
                <div class="card-body-free-service">
                    <p class="">${card.title}</p>
                    <h5 class="">${card.japaneseTitle}</h5>
                </div>
            </div>
        </div>
    `;
}

function renderCards() {
    const mainServicesContainer = document.querySelector('.concierge-paid-service-container');
    const otherServicesContainer = document.querySelector('.other-concierge-paid-service-container');
    const freeServicesContainer = document.querySelector('.free-service-container');

    if (mainServicesContainer && otherServicesContainer && freeServicesContainer) {
        mainServicesContainer.innerHTML = cardData.mainServices.map(card => createCard(card)).join('');
        otherServicesContainer.innerHTML = cardData.otherServices.map(card => createCard(card)).join('');
        freeServicesContainer.innerHTML = cardData.freeServices.map(card => createCardFreeService(card)).join('');
        
        // Add click event listeners to cards
        document.querySelectorAll('.btn-submit').forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const link = this.getAttribute('data-link');
                if (link) {
                    window.open(link, 'stripe-checkout', 'width=600,height=700');
                }
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', loadCardData); 