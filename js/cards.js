let cardData = {
    mainServices: [],
    otherServices: []
};

async function loadCardData() {
    try {
        const response = await fetch('/booking/data/services.json');
        const data = await response.json();
        console.log(data);
        
        // Split services into main and other services
        cardData.mainServices = data.services.slice(0, 4);
        cardData.otherServices = data.services.slice(4);
        
        renderCards();
    } catch (error) {
        console.error('Error loading card data:', error);
    }
}

function createCard(card) {
    return `
        <div class="col mt-1">
            <div class="card border-0 h-100 btn-submit" data-link="payment.html?id=${card.id}" style="cursor: pointer;">
                <img src="${card.image}" class="card-img-top custom-border" alt="${card.title}">
                <div class="card-body">
                    <p class="">${card.title}</p>
                    <h5 class="card-title">${card.japaneseTitle}</h5>
                    <p class="">${card.price.toLocaleString()} yen/per order</p>
                    <p class="">${card.description}</p>
                </div>
            </div>
        </div>
    `;
}

function renderCards() {
    const mainServicesContainer = document.querySelector('.row-cols-1.row-cols-sm-2.row-cols-md-4.g-6.pb-5.text-center.pt-2');
    const otherServicesContainer = document.querySelector('.row-cols-1.row-cols-sm-2.row-cols-md-4.g-6.pb-5.mb-5.text-center.pt-3');

    if (mainServicesContainer && otherServicesContainer) {
        mainServicesContainer.innerHTML = cardData.mainServices.map(card => createCard(card)).join('');
        otherServicesContainer.innerHTML = cardData.otherServices.map(card => createCard(card)).join('');
        
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