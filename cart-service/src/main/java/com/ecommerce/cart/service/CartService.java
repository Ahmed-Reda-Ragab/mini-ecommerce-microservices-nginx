package com.ecommerce.cart.service;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.concurrent.TimeUnit;

@Service
public class CartService {
    private static final Logger logger = LoggerFactory.getLogger(CartService.class);
    private final RedisTemplate<String, Cart> redisTemplate;
    private static final long CART_EXPIRY_HOURS = 24;

    public CartService(RedisTemplate<String, Cart> redisTemplate) {
        this.redisTemplate = redisTemplate;
        logger.info("[CART SERVICE] CartService initialized");
    }

    private String getCartKey(String userId) {
        return "cart:" + userId;
    }

    public Cart getCart(String userId) {
        logger.debug("[CART SERVICE] Getting cart for user: {}", userId);
        String key = getCartKey(userId);
        try {
            Cart cart = redisTemplate.opsForValue().get(key);
            
            if (cart == null) {
                logger.debug("[CART SERVICE] Cart not found for user: {}, creating new cart", userId);
                cart = new Cart();
                cart.setUserId(userId);
                cart.setCreatedAt(System.currentTimeMillis());
                cart.setUpdatedAt(System.currentTimeMillis());
            } else {
                logger.debug("[CART SERVICE] Cart found for user: {} with {} items", userId, cart.getItems().size());
            }
            return cart;
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error getting cart for user: {}", userId, e);
            throw e;
        }
    }

    public Cart addItem(String userId, CartItem item) {
        logger.info("[CART SERVICE] Adding item to cart - User: {}, Product: {} ({}x)", userId, item.getProductName(), item.getQuantity());
        try {
            Cart cart = getCart(userId);
            cart.addItem(item);
            saveCart(userId, cart);
            logger.debug("[CART SERVICE] Item added successfully. Cart now has {} items", cart.getItems().size());
            return cart;
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error adding item to cart for user: {}", userId, e);
            throw e;
        }
    }

    public Cart removeItem(String userId, String productId) {
        logger.info("[CART SERVICE] Removing item from cart - User: {}, Product: {}", userId, productId);
        try {
            Cart cart = getCart(userId);
            cart.removeItem(productId);
            saveCart(userId, cart);
            logger.debug("[CART SERVICE] Item removed successfully. Cart now has {} items", cart.getItems().size());
            return cart;
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error removing item from cart for user: {}", userId, e);
            throw e;
        }
    }

    public Cart updateItemQuantity(String userId, String productId, int quantity) {
        logger.info("[CART SERVICE] Updating item quantity - User: {}, Product: {}, New Quantity: {}", userId, productId, quantity);
        try {
            Cart cart = getCart(userId);
            cart.updateItemQuantity(productId, quantity);
            saveCart(userId, cart);
            logger.debug("[CART SERVICE] Item quantity updated successfully. Cart now has {} items", cart.getItems().size());
            return cart;
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error updating item quantity for user: {}", userId, e);
            throw e;
        }
    }

    public Cart clearCart(String userId) {
        logger.info("[CART SERVICE] Clearing cart - User: {}", userId);
        try {
            String key = getCartKey(userId);
            Cart cart = getCart(userId);
            logger.debug("[CART SERVICE] Cart has {} items before clearing", cart.getItems().size());
            cart.clear();
            saveCart(userId, cart);
            logger.debug("[CART SERVICE] Cart cleared successfully");
            return cart;
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error clearing cart for user: {}", userId, e);
            throw e;
        }
    }

    public void deleteCart(String userId) {
        logger.info("[CART SERVICE] Deleting cart - User: {}", userId);
        try {
            String key = getCartKey(userId);
            redisTemplate.delete(key);
            logger.debug("[CART SERVICE] Cart deleted successfully with key: {}", key);
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error deleting cart for user: {}", userId, e);
            throw e;
        }
    }

    private void saveCart(String userId, Cart cart) {
        logger.debug("[CART SERVICE] Saving cart for user: {} with {} items (TTL: {} hours)", userId, cart.getItems().size(), CART_EXPIRY_HOURS);
        try {
            String key = getCartKey(userId);
            redisTemplate.opsForValue().set(key, cart, CART_EXPIRY_HOURS, TimeUnit.HOURS);
            logger.debug("[CART SERVICE] Cart saved successfully with key: {}", key);
        } catch (Exception e) {
            logger.error("[CART SERVICE] Error saving cart for user: {}", userId, e);
            throw e;
        }
    }
}
