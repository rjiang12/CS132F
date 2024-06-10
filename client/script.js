/**
 * JS file setting up functions needed for the client side of the app. 
 */

(function() {
    "use strict";

    /**
     * init function setting up interactive elements. 
     */
    function init() {
        if(window.location.pathname.endsWith('index.html')) {
            qs('#nike').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'nike.html';
            });
            qs('#adidas').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'adidas.html';
            });
            qs('#all-stock').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'all.html';
            });
            qs('#sale-stock').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = 'sale.html';
            });
        }
        
        if(window.location.pathname.endsWith('nike.html')) {
            populateProducts('nike');
        }
        else if(window.location.pathname.endsWith('adidas.html')) {
            populateProducts('adidas');
        }
        else if(window.location.pathname.endsWith('all.html')) {
            populateProducts('');
        }
        else if(window.location.pathname.endsWith('sale.html')) {
            populateProducts('', true);
        }
        else if(window.location.pathname.includes('product.html')) {
            populateProductDetails(window.location.search.split('=').pop());
            qs('#home').addEventListener('click', () => {
                window.history.back();
            });
        }
        else if(window.location.pathname.endsWith('faq.html')) {
            populateFaq();
        }
        else if(window.location.pathname.endsWith('contact.html')) {
            qs('#contact-form').addEventListener('submit', function(event) {
                event.preventDefault();
                submitContactForm();
            });
        }
        else if(window.location.pathname.endsWith('cart.html')) {
            qs('#back').addEventListener('click', () => {
                window.history.back();
            });
            populateCart();
            qs('#submit-purchase').addEventListener('click', submitPurchase);
        }
    }

    /**
     * Removes residual error and success messages not currently applicable. 
     */
    function removeMessages() {
        if(qs('.error')) {
            qs('.error').remove();
        }
        if(qs('.success')){
            qs('.success').remove();
        }
    }
    
    /**
     * Fetches item data based on brand and sale status. 
     * @param {string} brand - brand name
     * @param {boolean} sale - marker indicating whether an item is on sale 
     * @returns all items matching the brand and sale parameters 
     */
    async function fetchStockData(brand, sale) {
        removeMessages();
        try {
            let toFetch = '/stock'; 
            if(sale) {
                toFetch += '?sale=true';
            }
            else {
                toFetch += `?brand=${brand}`
            }
            const response = await fetch(toFetch);
            await checkStatus(response);
            const data = await response.json();
            return data;
        } catch (error) {
            handleError(error);
            return [];
        }
    }

    /**
     * Populates page with items based on brand and sale status
     * @param {string} brand - brand name
     * @param {boolean} sale - marker indicating whether an item is on sale 
     */
    async function populateProducts(brand, sale=false) {
        removeMessages();
        const productsContainer = qs('.products');
        productsContainer.innerHTML = ''; 
        const products = await fetchStockData(brand, sale);
        products.forEach(product => {
            const productCard = gen('div');
            productCard.classList.add('product');
            productCard.id = product.id;
            
            const productName = gen('p');
            productName.textContent = product.name;
            
            const productImage = gen('img');
            productImage.src = `imgs/${product.img}`;
            productImage.alt = product.name;
            
            const productPrice = gen('p');
            productPrice.textContent = `$${product.price.toFixed(2)}`;
            if(product.sale) {
                productPrice.textContent += ' (SALE!)';
                productPrice.classList.add('on-sale');
            }
            
            productCard.appendChild(productName);
            productCard.appendChild(productImage);
            productCard.appendChild(productPrice);
            productCard.addEventListener('click', () => {
                window.location.href = `product.html?id=${product.id}`;
            });

            productsContainer.appendChild(productCard);
        });
    }

    /**
     * Populates all the item details for a specific item
     * @param {Number} productId - numerical id specifying which item
     */
    async function populateProductDetails(productId) {
        removeMessages();
        try {
            const response = await fetch(`/product/${productId}`);
            await checkStatus(response);
            const product = await response.json();

            document.title = product.name;
            qs('#product-side img').src = `imgs/${product.img}`;
            qs('#product-side img').alt = product.name;
            qs('#text-side h2').textContent = product.name;
            qs('#text-side #price').textContent = `$${product.price.toFixed(2)}`;
            if(product.sale) {
                qs('#text-side #price').classList.add('on-sale');
                qs('#text-side #price').textContent += ' (SALE!)';
            }
            qs('#text-side p').textContent = product.description;

            const addToCartButton = qs('button');
            addToCartButton.addEventListener('click', () => {
                addToCart(product);
            });
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Populates the FAQ section using FAQs from data
     */
    async function populateFaq() {
        removeMessages();
        try {
            const response = await fetch('/faq-data');
            await checkStatus(response);
            const faqs = await response.json();
            const faqContainer = qs('.faq');
            faqs.forEach(faq => {
                const faqItem = gen('div');
                faqItem.classList.add('faq-item');

                const question = gen('p');
                question.textContent = faq.question;
                question.classList.add('question-title');

                const answer = gen('p');
                answer.textContent = faq.answer;
                answer.classList.add('question-answer');

                faqItem.appendChild(question);
                faqItem.appendChild(answer);
                faqContainer.appendChild(faqItem);
            });
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Passes client inquiry to backend via contact form.
     */
    async function submitContactForm() {
        removeMessages();
        const form = qs('#contact-form');
        const formData = new FormData(form);

        const name = formData.get('name').trim();
        const email = formData.get('email').trim();
        const message = formData.get('message').trim();

        if (!name || !email || !message) {
            handleError(new Error('All fields are required.'));
            return;
        }

        try {
            const response = await fetch('/submit-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name, email: email, message: message })
            });

            await checkStatus(response);
            
            if(response.ok) {
                handleSuccess('Your message has been submitted successfully.');
                form.reset();
            }
        } catch (error) {
            handleError(error);
        }
    }

    /**
     * Adds a product to the user's cart
     * @param {Object} product - product object with all info
     */
    function addToCart(product) {
        removeMessages();
        const size = qs('#shoe-size').value;
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItem = { ...product, size };
        cart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(cart));
        handleSuccess('Item added to cart');
    }

    /**
     * Removes a particular item from the cart.
     * @param {Number} productId - id of the product to be removed
     * @param {Number} size - size of the product to be removed 
     */
    function removeFromCart(productId, size) {
        removeMessages();
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(cart.findIndex(product => 
            (product.id === productId && product.size === size)), 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        populateCart();
    }

    /**
     * Populates the cart page with items the user has added to the cart on other pages. 
     */
    function populateCart() {
        removeMessages();
        const cartContent = qs('#cart-content');
        cartContent.innerHTML = '';
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            cartContent.textContent = 'Your cart is empty.';
            return;
        }

        qs('.cart-items h2').textContent += ` (${cart.length})`;

        cart.forEach(product => {
            const productCard = gen('div');
            productCard.classList.add('product');
            productCard.dataset.id = product.id;

            const productName = gen('p');
            productName.textContent = `${product.name} (Size: ${product.size})`;

            const productImage = gen('img');
            productImage.src = `imgs/${product.img}`;
            productImage.alt = product.name;

            const productPrice = gen('p');
            productPrice.textContent = `$${product.price.toFixed(2)}`;

            const removeFromCartButton = gen('button');
            removeFromCartButton.id = 'remove-button';
            removeFromCartButton.textContent = 'Remove from Cart';
            removeFromCartButton.addEventListener('click', () => {
                removeFromCart(product.id, product.size);
            });

            productCard.appendChild(productName);
            productCard.appendChild(productImage);
            productCard.appendChild(productPrice);
            productCard.appendChild(removeFromCartButton);

            cartContent.appendChild(productCard);
        });
    }

    /**
     * Submits purchase. 
     * I didn't implement any backend for this so it actually just clears the page and 
     * shows that a purchase went through
     */
    function submitPurchase() {
        removeMessages();
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            handleError(new Error('Your cart is empty.'));
            return;
        }

        localStorage.removeItem('cart');
        populateCart();
        handleSuccess('Purchase submitted successfully.');
    }

    /**
     * Displays success message. 
     * @param {String} message - success message to display
     */
    function handleSuccess(message) {
        const container = qs('#success-space');
        let p = gen('p');
        p.textContent = message;
        p.classList.add('success');
        container.appendChild(p);
    }

    /**
     * Creates an error message for the user
     * @param {Error} error - error object with error message.
     */
    function handleError(error) {
        const container = qs('#error-space');
        let p = gen('p');
        p.textContent = `Error: ${error.message}`;
        p.classList.add('error');
        container.appendChild(p);
    }

    /**
   * Helper function to return the Response data if successful, otherwise
   * returns an Error that needs to be caught.
   * @param {object} response - response with status to check for success/error.
   * @returns {object} - The Response object if successful, otherwise an Error that
   * needs to be caught.
   */
    async function checkStatus(response) {
        if (!response.ok) {
            let errorMessage = 'Error';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                errorMessage = `This is REALLY bad (${e})`;
            }
            throw new Error(errorMessage);
        }
        return response;
    }

    init();
})();
