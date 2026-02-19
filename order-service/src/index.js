const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3003;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

// Internal service URLs (resolved via Docker internal DNS)
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory order store
let orders = [];

// ─── Middleware: Verify JWT ────────────────────────────────────────────────────
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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
        service: 'order-service',
        hostname: os.hostname(),
        ordersCount: orders.length,
    });
});

/**
 * POST /orders
 * Place a new order
 * Body: { productId, productName, quantity, price }
 */
app.post('/orders', verifyToken, async (req, res) => {
    try {
        const { productId, productName, quantity, price } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ error: 'productId and quantity are required' });
        }

        const hostname = os.hostname();
        const totalAmount = (parseFloat(price) || 0) * parseInt(quantity);

        const newOrder = {
            id: `ORD-${Date.now()}`,
            productId,
            productName: productName || 'Unknown Product',
            quantity: parseInt(quantity),
            pricePerUnit: parseFloat(price) || 0,
            totalAmount,
            userId: req.user.userId,
            username: req.user.username,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        };

        orders.push(newOrder);

        console.log(`[ORDER] New order ${newOrder.id} created — served by container: ${hostname}`);

        // Fire-and-forget: send notification asynchronously
        // Don't fail the request if notification service is down
        fetch(`${NOTIFICATION_SERVICE_URL}/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'order_confirmation',
                orderId: newOrder.id,
                username: newOrder.username,
                productName: newOrder.productName,
                quantity: newOrder.quantity,
                totalAmount: newOrder.totalAmount,
            }),
        }).catch(err => {
            console.warn(`[ORDER] Notification service unreachable: ${err.message}`);
        });

        return res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder,
            served_by: hostname,
        });
    } catch (err) {
        console.error('[ORDER] Create order error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /orders
 * Returns all orders for the authenticated user
 */
app.get('/orders', verifyToken, (req, res) => {
    const hostname = os.hostname();
    console.log(`[ORDER] GET /orders served by container: ${hostname}`);

    // In production, filter by user. Here we return all for demo.
    const userOrders = orders.filter(o => o.userId === req.user.userId);

    return res.json({
        orders: userOrders,
        total: userOrders.length,
        served_by: hostname,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`[ORDER] Order Service running on port ${PORT} | Hostname: ${os.hostname()}`);
});
