/**
 * Server file setting up all backend routes for the shoe store app.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.json());

/**
 * Serves nike.html page
 */
app.get('/nike', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'nike.html'));
});

/**
 * Serves adidas.html page
 */
app.get('/adidas', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'adidas.html'));
});

/**
 * Serves all.html page
 */
app.get('/all', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'all.html'));
});

/**
 * Serves sale.html page
 */
app.get('/sale', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'sale.html'));
});

/**
 * Returns all stock as a JSON array matching any query parameters given like 
 * brand or sale status. 
 * Example: 
 * [{
        "name": "Nike Blazer Mid",
        "price": 109.99,
        "description": "Nike Blazer Mid - classic since the beginning.",
        "brand": "Nike",
        "sale": false,
        "img": "bm77.png",
        "id": 1
    }]
 * Returns 500 error if server cannot read data. 
 */
app.get('/stock', (req, res) => {
    fs.readFile(path.join(__dirname, 'stock.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading stock data');
            return;
        }
        res.status(200);
        const products = JSON.parse(data);
        const brand = req.query.brand;
        const sale = req.query.sale;
        if (brand) {
            const filteredProducts = products.filter(product => product.brand.toLowerCase() === brand.toLowerCase());
            res.json(filteredProducts);
        } 
        else if (sale) {
            const filteredProducts = products.filter(product => product.sale);
            res.json(filteredProducts);
        }
        else {
            res.json(products);
        }
    });
});

/**
 * Serves product.html page
 * Returns 400 error if fetched without required id parameter
 */
app.get('/product', (req, res) => {
    if (!req.params || !req.params.id) {
        res.status(400).json({ error: 'Missing id field' });
    }
    res.sendFile(path.join(__dirname, 'client', 'product.html'));
});

/**
 * Returns all information for a particular item based on the given ID
 * Example: 
 * [{
        "name": "Nike Blazer Mid",
        "price": 109.99,
        "description": "Nike Blazer Mid - classic since the beginning.",
        "brand": "Nike",
        "sale": false,
        "img": "bm77.png",
        "id": 1
    }]
 * Returns 404 error if the product isn't found (ID doesn't match any existing product). 
 * Returns 500 error if server cannot read data. 
 */
app.get('/product/:id', (req, res) => {
    fs.readFile(path.join(__dirname, 'stock.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading stock data');
            return;
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id == req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).send('Product not found');
        }
    });
});

/**
 * Returns faq data as a JSON array. 
 * Example: 
 * [{
        "question": "What is your return policy?",
        "answer": "We accept returns within 30 days of purchase. Items must be in original condition."
    }]
 * Returns 500 error if server cannot read data. 
 */
app.get('/faq-data', (req, res) => {
    fs.readFile(path.join(__dirname, 'faq.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading FAQ data');
            return;
        }
        res.status(200).json(JSON.parse(data));
    });
});

/**
 * Serves contact.html page 
 */
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'contact.html'));
});

/**
 * Submits a user inquiry from contact page form to the questions data.
 * Required POST parameters: name, email, message.
 * Returns a 400 error if any of the required POST parameters are missing.
 * Returns a 500 error if server cannot read data or if server cannot write data.
 */
app.post('/submit-question', (req, res) => {
    const { name, email, message } = req.body;
    if(!name || !email || !message) {
        res.status(400).json({ error: 'Missing fields'});
    }
    const question = {name: name, email: email, message: message};

    fs.readFile(path.join(__dirname, 'questions.json'), 'utf8', (err, data) => {
        if(err) {
            res.status(500).json({ error: 'Failed to read questions' });
            return;
        }

        const questions = JSON.parse(data);
        questions.push(question);

        fs.writeFile(path.join(__dirname, 'questions.json'), JSON.stringify(questions), (err) => {
            if (err) {
                res.status(500).send('Error writing question');
                return;
            }
            res.status(201).send('Question submitted');
        });
    });
});

/**
 * Serves the cart.html page
 */
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'cart.html'));
});

/**
 * Catch all 404 not found error for unknown endpoints 
 */
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
