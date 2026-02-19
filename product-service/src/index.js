const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory product store — seeded with sample data
let products = [
    {
        id: '1',
        name: 'Wireless Headphones',
        description: 'Premium noise-cancelling wireless headphones',
        price: 199.99,
        category: 'Electronics',
        stock: 50,
        image: 'https://picsum.photos/seed/headphones/400/300',
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches',
        price: 149.99,
        category: 'Electronics',
        stock: 30,
        image: 'https://picsum.photos/seed/keyboard/400/300',
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        name: 'Ergonomic Mouse',
        description: 'Vertical ergonomic mouse for all-day comfort',
        price: 79.99,
        category: 'Electronics',
        stock: 75,
        image: 'https://picsum.photos/seed/mouse/400/300',
        createdAt: new Date().toISOString(),
    },
    {
        id: '4',
        name: 'USB-C Hub',
        description: '7-in-1 USB-C Hub with HDMI, SD card, and USB 3.0 ports',
        price: 49.99,
        category: 'Accessories',
        stock: 100,
        image: 'https://picsum.photos/seed/hub/400/300',
        createdAt: new Date().toISOString(),
    },
    {
        id: '5',
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for better ergonomics',
        price: 39.99,
        category: 'Accessories',
        stock: 60,
        image: 'https://picsum.photos/seed/stand/400/300',
        createdAt: new Date().toISOString(),
    },
    {
        id: '6',
        name: 'Webcam 4K',
        description: '4K autofocus webcam with built-in microphone',
        price: 129.99,
        category: 'Electronics',
        stock: 40,
        image: 'https://picsum.photos/seed/webcam/400/300',
        createdAt: new Date().toISOString(),
    },
];

// ─── Middleware: Verify JWT ────────────────────────────────────────────────────
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'product-service',
        hostname: os.hostname(),
        productsCount: products.length,
    });
});

/**
 * GET /products
 * Returns all products — includes served_by to show which container handled this
 */
app.get('/products', verifyToken, (req, res) => {
    const hostname = os.hostname();
    console.log(`[PRODUCT] GET /products served by container: ${hostname}`);

    return res.json({
        products,
        total: products.length,
        served_by: hostname,
    });
});

/**
 * GET /products/:id
 * Returns a single product
 */
app.get('/products/:id', verifyToken, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ product, served_by: os.hostname() });
});

/**
 * POST /products
 * Create a new product
 * Body: { name, description, price, category, stock }
 */
app.post('/products', verifyToken, (req, res) => {
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    const newProduct = {
        id: Date.now().toString(),
        name,
        description: description || '',
        price: parseFloat(price),
        category: category || 'General',
        stock: parseInt(stock) || 0,
        image: `https://picsum.photos/seed/${Date.now()}/400/300`,
        createdAt: new Date().toISOString(),
    };

    products.push(newProduct);

    const hostname = os.hostname();
    console.log(`[PRODUCT] POST /products — new product "${name}" created by container: ${hostname}`);

    return res.status(201).json({
        message: 'Product created successfully',
        product: newProduct,
        served_by: hostname,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`[PRODUCT] Product Service running on port ${PORT} | Hostname: ${os.hostname()}`);
});
