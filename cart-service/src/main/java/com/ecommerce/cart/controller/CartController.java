package com.ecommerce.cart.controller;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CartController {
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
        logger.info("[CART CONTROLLER] CartController initialized");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        logger.info("[API] GET /api/cart/{} - Retrieving cart", userId);
        try {
            Cart cart = cartService.getCart(userId);
            logger.debug("[API] GET /api/cart/{} - Success: {} items in cart", userId, cart.getItems().size());
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            logger.error("[API] GET /api/cart/{} - Error", userId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Cart> addItem(@PathVariable String userId, @RequestBody CartItem item) {
        logger.info("[API] POST /api/cart/{}/add - Adding item: {}", userId, item.getProductName());
        try {
            if (item.getQuantity() <= 0) {
                logger.warn("[API] POST /api/cart/{}/add - Invalid quantity: {}", userId, item.getQuantity());
                return ResponseEntity.badRequest().build();
            }
            Cart cart = cartService.addItem(userId, item);
            logger.debug("[API] POST /api/cart/{}/add - Success", userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            logger.error("[API] POST /api/cart/{}/add - Error", userId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{userId}/item/{productId}")
    public ResponseEntity<Cart> removeItem(@PathVariable String userId, @PathVariable String productId) {
        logger.info("[API] DELETE /api/cart/{}/item/{} - Removing item", userId, productId);
        try {
            Cart cart = cartService.removeItem(userId, productId);
            logger.debug("[API] DELETE /api/cart/{}/item/{} - Success", userId, productId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            logger.error("[API] DELETE /api/cart/{}/item/{} - Error", userId, productId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{userId}/item/{productId}/quantity")
    public ResponseEntity<Cart> updateItemQuantity(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestBody Map<String, Integer> request) {
        logger.info("[API] PUT /api/cart/{}/item/{}/quantity - Updating quantity", userId, productId);
        try {
            Integer quantity = request.get("quantity");
            if (quantity == null || quantity < 0) {
                logger.warn("[API] PUT /api/cart/{}/item/{}/quantity - Invalid quantity: {}", userId, productId, quantity);
                return ResponseEntity.badRequest().build();
            }
            logger.debug("[API] PUT /api/cart/{}/item/{}/quantity - New quantity: {}", userId, productId, quantity);
            Cart cart = cartService.updateItemQuantity(userId, productId, quantity);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            logger.error("[API] PUT /api/cart/{}/item/{}/quantity - Error", userId, productId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Map<String, String>> clearCart(@PathVariable String userId) {
        logger.info("[API] DELETE /api/cart/{}/clear - Clearing cart", userId);
        try {
            cartService.clearCart(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart cleared successfully");
            logger.debug("[API] DELETE /api/cart/{}/clear - Success", userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[API] DELETE /api/cart/{}/clear - Error", userId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{userId}/summary")
    public ResponseEntity<Map<String, Object>> getCartSummary(@PathVariable String userId) {
        logger.info("[API] GET /api/cart/{}/summary - Getting cart summary", userId);
        try {
            Cart cart = cartService.getCart(userId);
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalItems", cart.getTotalItems());
            summary.put("totalPrice", cart.getTotalPrice());
            summary.put("itemCount", cart.getItems().size());
            logger.debug("[API] GET /api/cart/{}/summary - Total items: {}, Total price: $", userId, cart.getTotalItems(), cart.getTotalPrice());
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("[API] GET /api/cart/{}/summary - Error", userId, e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, String>> deleteCart(@PathVariable String userId) {
        logger.info("[API] DELETE /api/cart/{} - Deleting cart", userId);
        try {
            cartService.deleteCart(userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart deleted successfully");
            logger.debug("[API] DELETE /api/cart/{} - Success", userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("[API] DELETE /api/cart/{} - Error", userId, e);
            return ResponseEntity.status(500).build();
        }
    }
}
