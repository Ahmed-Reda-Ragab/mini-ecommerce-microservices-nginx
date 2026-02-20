package com.ecommerce.cart.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart implements Serializable {
    private String userId;
    private Map<String, CartItem> items = new HashMap<>();
    private long createdAt;
    private long updatedAt;

    public void addItem(CartItem item) {
        if (items.containsKey(item.getProductId())) {
            CartItem existing = items.get(item.getProductId());
            existing.setQuantity(existing.getQuantity() + item.getQuantity());
        } else {
            items.put(item.getProductId(), item);
        }
        this.updatedAt = System.currentTimeMillis();
    }

    public void removeItem(String productId) {
        items.remove(productId);
        this.updatedAt = System.currentTimeMillis();
    }

    public void updateItemQuantity(String productId, int quantity) {
        if (items.containsKey(productId)) {
            if (quantity <= 0) {
                items.remove(productId);
            } else {
                items.get(productId).setQuantity(quantity);
            }
            this.updatedAt = System.currentTimeMillis();
        }
    }

    public double getTotalPrice() {
        return items.values().stream()
                .mapToDouble(CartItem::getTotalPrice)
                .sum();
    }

    public int getTotalItems() {
        return items.values().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    public void clear() {
        items.clear();
        this.updatedAt = System.currentTimeMillis();
    }
}
