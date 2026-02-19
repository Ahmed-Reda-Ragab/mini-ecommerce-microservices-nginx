const express = require('express');
const morgan = require('morgan');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service', hostname: os.hostname() });
});

/**
 * POST /notify
 * Send a notification (Mock)
 * Body: { type, userId, message, ... }
 */
app.post('/notify', (req, res) => {
    const { type, orderId, username, productName, quantity, totalAmount } = req.body;

    console.log('----- NOTIFICATION LOG -----');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Service Host: ${os.hostname()}`);

    if (type === 'order_confirmation') {
        console.log(`Event: Order Confirmation`);
        console.log(`To: ${username}`);
        console.log(`Message: Your order ${orderId} for ${quantity}x ${productName} (Total: $${totalAmount}) has been confirmed!`);
    } else {
        console.log(`Event: ${type}`);
        console.log(`Payload:`, req.body);
    }
    console.log('----------------------------');

    return res.json({
        message: 'Notification sent',
        served_by: os.hostname(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`[NOTIFY] Notification Service running on port ${PORT} | Hostname: ${os.hostname()}`);
});
