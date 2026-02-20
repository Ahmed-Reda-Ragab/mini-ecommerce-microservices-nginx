# Cart Service with Redis

A Spring Boot microservice for managing shopping carts with Redis persistence.

## Features

- **In-Memory Cart Storage**: Uses Redis for fast cart operations
- **User-Specific Carts**: Each user has their own cart with 24-hour TTL
- **Cart Operations**:
  - Add items to cart
  - Update item quantities
  - Remove items
  - Clear entire cart
  - Get cart summary

## API Endpoints

### Get User Cart
```bash
GET /api/cart/{userId}
```
Response: Returns the complete Cart object with all items

### Add Item to Cart
```bash
POST /api/cart/{userId}/add
Content-Type: application/json

{
  "productId": "1",
  "productName": "Product Name",
  "price": 29.99,
  "quantity": 2
}
```

### Update Item Quantity
```bash
PUT /api/cart/{userId}/item/{productId}/quantity
Content-Type: application/json

{
  "quantity": 5
}
```

### Remove Item from Cart
```bash
DELETE /api/cart/{userId}/item/{productId}
```

### Clear Cart
```bash
DELETE /api/cart/{userId}/clear
```

### Get Cart Summary
```bash
GET /api/cart/{userId}/summary
```
Response: Returns totalItems, totalPrice, and itemCount

### Delete Cart
```bash
DELETE /api/cart/{userId}
```

## Build & Run

### Prerequisites
- Java 17+
- Maven 3.9+
- Redis 8.2.4+

### Build
```bash
mvn clean package
```

### Run with Docker
```bash
docker-compose up --build cart-service
```

## Logging

The service includes comprehensive logging with log levels:
- **INFO**: API requests and major operations
- **DEBUG**: Detailed operation tracking
- **ERROR**: Exception handling

All logs are prefixed with categories:
- `[CART SERVICE]` - Service layer operations
- `[CART CONTROLLER]` - API controller operations
- `[REDIS CONFIG]` - Redis configuration and connection
- `[API]` - HTTP request/response logging

Example logs:
```
2026-02-20 14:21:57 - [API] POST /api/cart/user123/add - Adding item: Product Name
2026-02-20 14:21:57 - [CART SERVICE] Adding item to cart - User: user123, Product: Product Name (2x)
2026-02-20 14:21:57 - [CART SERVICE] Saving cart for user: user123 with 3 items (TTL: 24 hours)
```

## Redis Connection

The service connects to Redis at:
- **Host**: redis (from docker-compose)
- **Port**: 6379
- **Database**: 0
- **Timeout**: 60000ms

## Configuration

[application.properties](src/main/resources/application.properties):
- Server port: 3005
- Redis host/port: redis:6379
- Connection pool: 8 max connections
- Cart TTL: 24 hours

## Testing with cURL

### Add item to cart:
```bash
curl -X POST http://localhost/api/cart/user1/add \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "1",
    "productName": "Laptop",
    "price": 999.99,
    "quantity": 1
  }'
```

### Get cart:
```bash
curl http://localhost/api/cart/user1
```

### Update quantity:
```bash
curl -X PUT http://localhost/api/cart/user1/item/1/quantity \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

### Clear cart:
```bash
curl -X DELETE http://localhost/api/cart/user1/clear
```
