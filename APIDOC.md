# Shoe Store API Documentation
** Roy Jiang **
This API is designed to retrieve shoe inventory, retrieve frequently asked questions, and 
intake customer inquiries. Shared behavior includes 500 errors for server issues with reading and/or writing to the respective data files. 
In addition, there is a catch-all 404 for unknown endpoints. 


## GET /stock

**Request Format:** 
/stock or /stock?brand=nike or /stock?sale=true

**Returned Data Format**: JSON

**Description:** 
Returns all stock as a JSON array matching any query parameters given like brand or sale status.

**Supported Parameters**
Query parameters: 
- `brand` (optional): Filters products by brand.
- `sale` (optional): Filters products on sale. Must be boolean. 

**Example Request:** 
```javascript
fetch('/stock?brand=nike')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

**Example Response:**
```json
[
    {
        "name": "Nike Blazer Mid",
        "price": 109.99,
        "description": "Nike Blazer Mid - classic since the beginning.",
        "brand": "Nike",
        "sale": false,
        "img": "bm77.png",
        "id": 1
    },
    {
        "name": "Nike Air Force 1",
        "price": 99.99,
        "description": "No introduction needed - you already know.",
        "brand": "Nike",
        "sale": true,
        "img": "af1.png",
        "id": 2
    },
    ...
]
```

**Error Handling:**
* 404 Not Found Error - if no items are found for a brand or if the brand name is not recognized. 
```javascript
fetch('/stock?brand=bonk')
```
```json
{
    "error": "No items for this brand. Please double check brand name."
}
```
* 500 Internal Server Error - server unable to retrieving information about current stock
```json
{
    "error": "Error retrieving stock"
}
```

## GET /product/:id
**Request Format:** 
/product/1

**Returned Data Format**: JSON

**Description:** 
Gets a specific item based on given ID 

**Supported Parameters** 
Parameter: 
- `id` (required): id of product to get

**Example Request:** 
```javascript
fetch('/product/15')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

**Example Response:**
```json
{
    "name": "Adidas Superstar",
    "price": 139.99,
    "description": "The ultimate everyday shoe. Classy.",
    "brand": "Adidas",
    "sale": false,
    "img": "superstar.webp",
    "id": 15
}
```

**Error Handling:**
* 404 Not Found Error - ID does not correspond to an existing item/invalid ID.
```json
{
    "error": "Product not found"
}
```
* 500 Internal Server Error - server unable to retrieve information about current stock
```json
{
    "error": "Error retrieving stock"
}
```

## GET /faq-data
**Request Format:** 
/faq-data

**Returned Data Format**: JSON

**Description:** 
Gets stored FAQs

**Supported Parameters** 
- none

**Example Request:** 
```javascript
fetch('/faq-data')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

**Example Response:**
```json
[
    {
        "question": "What is your return policy?",
        "answer": "We accept returns within 30 days of purchase. Items must be in original condition."
    },
    {
        "question": "How can I track my order?",
        "answer": "You can track your order using the tracking number provided in the shipment confirmation email."
    }
]
```

**Error Handling:**
* 500 Internal Server Error - server unable retrieve FAQs
```json
{
    "error": "Error retrieving FAQs"
}
```

## POST /submit-question
**Request Format:** 
/submit-question

**Returned Data Format**: JSON

**Description:** 
Submits a customer inquiry

**Supported Parameters** 
Body parameters: 
- `name` (required): customer name
- `email` (required): customer email
- `message` (required): customer message

**Example Request:** 
```javascript
fetch('/submit-question', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'What is your return policy?'
    })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

**Example Response:**
```json
Question submitted
```

**Error Handling:**
* 400 Bad Request Error - missing any number of required parameters
```json
{
    "error": "Missing fields"
}
```
* 500 Internal Server Error - server unable to read or write question(s)
```json
{
    "error": "Error retrieving questions"
}
{
    "error": "Error writing question"
}
```

## GET /* (where * is nike, adidas, all, sale, contact, cart)
**Request Format:** 
/name

**Returned Data Format**: HTML

**Description:** 
Gets and serves HTML page

**Example Request:** 
```javascript
fetch('/index.html')
    .then(response => response.text())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
```

**Example Response:**
*index.html contents*