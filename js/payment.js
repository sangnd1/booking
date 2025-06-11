// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_51QF5LnRxnoyVccAfLkhqRy9fxOepB7noXi0WWEXcVet5iWyyrNCXLhp7FFTj5nkIcghUUThThA8bqmzjsczl1EG500e0IkEpj8'); // Replace with your actual publishable key
const elements = stripe.elements();

// Load service data
let serviceData = null;
let currentService = null;

async function loadServiceData() {
    try {
        const response = await fetch('/booking/data/services.json');
        const data = await response.json();
        serviceData = data.services;
        updateBookingDetails();
    } catch (error) {
        console.error('Error loading service data:', error);
    }
}

function updateBookingDetails() {
    const url = window.location.href;
    const serviceId = parseInt(url.split('id=')[1]);
    
    if (serviceData && serviceId) {
        currentService = serviceData.find(s => s.id === serviceId);
        if (currentService) {
            // Update title and description
            const titleElement = document.querySelector('.service-title');
            const descriptionElement = document.querySelector('.service-description');
            if (titleElement) {
                titleElement.textContent = currentService.japaneseTitle;
            }
            if (descriptionElement) {
                descriptionElement.textContent = currentService.description.replace(/\\n/g, '\n');
            }

            // Update image
            const roomImg = document.querySelector('.room-img');
            if (roomImg) {
                roomImg.src = currentService.image;
                roomImg.alt = currentService.japaneseTitle;
            }

            // Update price
            const totalPrice = currentService.price;

            const priceInfo = document.querySelector('.price-info');
            if (priceInfo) {
                priceInfo.innerHTML = `
                    <div class="grand-total"><b>合計金額</b> <span class="right">${totalPrice.toLocaleString()}円</span></div>
                `;
            }
        }
    }
}

// Create card Element and mount it
const cardElement = elements.create('card', {
    style: {
        base: {
            fontSize: '16px',
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            '::placeholder': {
                color: '#aab7c4'
            },
            ':-webkit-autofill': {
                color: '#32325d'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    },
    placeholder: 'カード番号',
    hidePostalCode: true
});

cardElement.mount('#card-element');

// Initialize date picker with today's date
const today = new Date();
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const weekday = weekdays[today.getDay()];
const formattedToday = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${weekday}）`;
document.getElementById('checkin-display').textContent = formattedToday;

const fp = flatpickr("#checkin", {
    dateFormat: "Y-m-d",
    minDate: "today",
    defaultDate: "today",
    onChange: function(selectedDates, dateStr) {
        // Format date for display
        const date = selectedDates[0];
        const weekday = weekdays[date.getDay()];
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${weekday}）`;
        document.getElementById('checkin-display').textContent = formattedDate;
    }
});

// Add validation for accommodation select
const accommodationSelect = document.querySelector('select');
accommodationSelect.addEventListener('change', function() {
    validateField(this, '宿泊施設を選択してください');
});

// Add validation for email input
const emailInput = document.querySelector('input[type="email"]');
emailInput.addEventListener('input', function() {
    validateEmail(this);
});

function validateEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.value.trim()) {
        showError(input, 'メールアドレスを入力してください');
        return false;
    } else if (!emailRegex.test(input.value.trim())) {
        showError(input, '有効なメールアドレスを入力してください');
        return false;
    } else {
        removeError(input);
        return true;
    }
}

function validateField(field, errorMessage) {
    if (!field.value.trim()) {
        showError(field, errorMessage);
        return false;
    } else {
        removeError(field);
        return true;
    }
}

function showError(field, message) {
    removeError(field);
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.style.color = 'red';
    errorMessage.style.fontSize = '12px';
    errorMessage.style.marginTop = '5px';
    field.parentElement.appendChild(errorMessage);
}

function removeError(field) {
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Modal functionality
const errorModal = document.getElementById('errorModal');
const successModal = document.getElementById('successModal');
const closeButtons = document.getElementsByClassName('close');


function showModal(modal) {
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modal) {
    console.log(modal);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking the X button
Array.from(closeButtons).forEach(button => {
    console.log(button);
    button.onclick = function() {
        hideModal(errorModal);
        hideModal(successModal);
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === errorModal) {
        hideModal(errorModal);
    }
    if (event.target === successModal) {
        hideModal(successModal);
    }
}

// Handle form submission
const form = document.querySelector('form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    // Validate all fields
    const isAccommodationValid = validateField(accommodationSelect, '宿泊施設を選択してください');
    const isEmailValid = validateEmail(emailInput);
    const isCardholderNameValid = validateField(
        document.getElementById('cardholder-name'),
        'カード名義を入力してください'
    );

    if (!isAccommodationValid || !isEmailValid || !isCardholderNameValid) {
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = '処理中...';

    try {
        const {paymentMethod, error} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: {
                name: document.getElementById('cardholder-name').value,
            },
        });

        if (error) {
            showModal(errorModal);
            submitButton.disabled = false;
            submitButton.textContent = '予約を確定する';
        } else {
            // Send paymentMethod.id to your server
            const response = await fetch('https://script.google.com/macros/s/AKfycbyJtEtE9sUKXcUrUTW13k_CXeUbuc2pDjGIaObrnmf6LloVyVO2p34IxysUJwwHBVqT/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8'
                },
                body: JSON.stringify({
                    paymentMethodId: paymentMethod.id,
                    amount: currentService ? currentService.price : 0,
                    currency: 'jpy',
                    checkInDate: document.getElementById('checkin').value,
                    email: emailInput.value,
                    accommodation: accommodationSelect.value
                })
            });

            const result = await response.json();
            console.log(result);
            console.log(result.status === 'error');

            if (result.status === 'error') {
                showModal(errorModal);
                submitButton.disabled = false;
                submitButton.textContent = '予約を確定する';
            } else if (result.client_secret) {
                // Confirm the payment with the client secret
                const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(result.client_secret);
                
                if (confirmError) {
                    showModal(errorModal);
                } else if (paymentIntent.status === 'succeeded') {
                    showModal(successModal);
                    form.reset();
                } else {
                    showModal(errorModal);
                }
            }
            submitButton.disabled = false;
            submitButton.textContent = '予約を確定する';
        }
    } catch (err) {
        console.error('Error:', err);
        showModal(errorModal);
        submitButton.disabled = false;
        submitButton.textContent = '予約を確定する';
    }
});

// Load service data when the page loads
document.addEventListener('DOMContentLoaded', loadServiceData); 
