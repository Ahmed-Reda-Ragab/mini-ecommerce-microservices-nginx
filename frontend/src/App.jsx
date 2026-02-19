import React, { useState, useEffect } from 'react';

// Use relative URLs so requests go through Nginx (which serves this app)
const API_BASE = '/api';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
    const [view, setView] = useState('products'); // 'products', 'orders'

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token) {
            if (view === 'products') fetchProducts();
            if (view === 'orders') fetchOrders();
        }
    }, [token, view]);

    const login = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (err) {
            setAuthError(err.message);
        }
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setView('products');
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/products`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setProducts(data.products || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setOrders(data.orders || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async (product) => {
        const quantity = prompt(`Enter quantity for ${product.name}:`, '1');
        if (!quantity || isNaN(quantity) || quantity <= 0) return;

        try {
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product.id,
                    productName: product.name,
                    quantity: parseInt(quantity),
                    price: product.price,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Order placed! Order ID: ${data.order.id} (Served by: ${data.served_by})`);
                setTimeout(() => setMessage(''), 5000);
            } else {
                alert(data.error || 'Failed to place order');
            }
        } catch (err) {
            console.error(err);
            alert('Error placing order');
        }
    };

    if (!token) {
        return (
            <div className="container center">
                <div className="card login-card">
                    <h2>Login</h2>
                    <form onSubmit={login}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        {authError && <p className="error">{authError}</p>}
                        <button type="submit" className="btn-primary">Login</button>
                    </form>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        (Register endpoint exists but UI implementation is skipped for brevity. try user1/pass1 if seeded or register via Curl)
                        <br />
                        <strong>Note:</strong> Since in-memory auth service is fresh, please REGISTER first via Postman/Curl or add auto-register logic here?
                        <br />Actually, I'll add a register button for convenience.
                    </p>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={async () => {
                            // Quick register logic for demo
                            try {
                                const res = await fetch(`${API_BASE}/auth/register`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ username, password })
                                });
                                if (res.ok) {
                                    alert('Registered! Now login.');
                                } else {
                                    const d = await res.json();
                                    alert(d.error);
                                }
                            } catch (e) { alert(e.message); }
                        }}
                    >
                        Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="header">
                <h1>Mini E-Commerce</h1>
                <div className="user-info">
                    <span>Welcome, {user?.username}</span>
                    <button onClick={logout} className="btn-small">Logout</button>
                </div>
            </header>

            <nav className="nav">
                <button
                    className={view === 'products' ? 'active' : ''}
                    onClick={() => setView('products')}
                >
                    Products
                </button>
                <button
                    className={view === 'orders' ? 'active' : ''}
                    onClick={() => setView('orders')}
                >
                    Orders
                </button>
            </nav>

            <main className="main-content">
                {message && <div className="success-message">{message}</div>}

                {view === 'products' && (
                    <div className="products-grid">
                        {products.map(p => (
                            <div key={p.id} className="product-card">
                                <img src={p.image} alt={p.name} className="product-img" />
                                <div className="product-details">
                                    <h3>{p.name}</h3>
                                    <p className="price">${p.price}</p>
                                    <p className="stock">Stock: {p.stock}</p>
                                    <button onClick={() => createOrder(p)} className="btn-primary">Buy Now</button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && !loading && <p>No products found or check connection.</p>}
                    </div>
                )}

                {view === 'orders' && (
                    <div className="orders-list">
                        <h2>Your Orders</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>{o.id}</td>
                                        <td>{o.productName}</td>
                                        <td>{o.quantity}</td>
                                        <td>${o.totalAmount}</td>
                                        <td>{o.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && !loading && <p>No orders yet.</p>}
                    </div>
                )}
            </main>
        </div>
    );
}
