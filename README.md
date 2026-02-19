# Mini E-Commerce Microservices Platform

A production-like microservices architecture demonstration using **Node.js**, **Express**, **Docker**, **NGINX**, and **React**.

## 🚀 Architecture Overview

This project simulates a real-world e-commerce system where backend services are decoupled and independently scalable. Communication happens via HTTP REST APIs, orchestrated by an NGINX API Gateway.

### Components

1.  **API Gateway (NGINX)**: Single entry point for all client requests. Handles routing, load balancing, and reverse proxying.
2.  **Frontend (React)**: User interface for browsing products and placing orders. Consumes APIs via the Gateway.
3.  **Auth Service**: Manages user registration and JWT-based authentication.
4.  **Product Service**: Manages product catalog. Scalable (Stateful in memory for demo purposes, but designed for horizontal scaling).
5.  **Order Service**: Handles order placement and retrieves order history. Asynchronously notifies the Notification Service.
6.  **Notification Service**: Simulates sending emails/SMS for system events (e.g., Order Confirmation).

### Architecture Diagram

```
graph TD
    Client[Client Browser] -->|HTTP:80| NGINX[NGINX Gateway & LB]
    
    NGINX -->|/| Frontend[Frontend React App]
    NGINX -->|/api/auth| Auth[Auth Service]
    NGINX -->|/api/products| Product[Product Service (Scaled x3)]
    NGINX -->|/api/orders| Order[Order Service]
    NGINX -->|/api/notify| Notify[Notification Service]
```

## 🛠️ How to Run

### Prerequisites
- Docker & Docker Compose installed

### Steps

1.  **Clone the repository** (if applicable)
2.  **Start the services**:
    ```bash
    docker compose up --build
    ```
3.  **Access the application**:
    Open your browser and navigate to `http://localhost`.

---

## 📈 Scaling Services

You can scale services horizontally using Docker Compose. NGINX will automatically load balance traffic between the instances.

**Example: Scale Product Service to 3 instances**
```bash
docker compose up -d --scale product-service=3
```

**How Load Balancing Works:**
- Docker's internal DNS resolves `product-service` to the IP addresses of all running containers for that service.
- NGINX uses these IPs in a Round Robin fashion to distribute traffic.
- Each response includes a `"served_by": "<container-id>"` field, allowing you to see exactly which instance handled your request in the frontend or API response (Use Postman or curl to verify).

---

## 📡 Frontend-Backend Communication

The Frontend application knows **nothing** about the internal microservices topology. It sends all requests to `/api/...`, which NGINX routes to the appropriate service.

**Example Flow:**
1.  User clicks "Buy Now" on Frontend.
2.  Frontend sends `POST /api/orders` to NGINX.
3.  NGINX rewrites URL to `/orders` and forwards to `order-service`.
4.  Order Service processes request, saves order, and sends async notification.
5.  Response returns to Frontend via NGINX.

---

## 🏭 Real-World Production Use Cases

This architecture demonstrates several key patterns used in large-scale systems:

1.  **API Gateway Pattern**: Hides internal complexity, provides a unified interface, and centralizes cross-cutting concerns (SSL, Auth, Rate Limiting).
2.  **Service Discovery & Load Balancing**: Services can scale up/down without client reconfiguration.
3.  **Asynchronous Communication**: The Order Service "fires and forgets" a notification request, ensuring the user isn't blocked by third-party email providers.
4.  **Containerization**: Ensures consistency across development, testing, and production environments.
5.  **Statelessness**: The Auth Service issues self-contained JWT tokens, allowing any service instance to verify identity without shared session storage (though in this demo we use in-memory stores for simplicity).

## 📝 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & receive JWT |
| GET | `/api/products` | List all products |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | List user orders |

---

**Note**: Since this is a demo using in-memory storage, all data (users, products, orders) will reset if you restart the containers.
