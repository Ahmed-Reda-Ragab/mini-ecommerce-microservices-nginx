package com.ecommerce.cart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class CartApplication {
    private static final Logger logger = LoggerFactory.getLogger(CartApplication.class);

    public static void main(String[] args) {
        logger.info("========================================");
        logger.info("Starting Cart Service Application...");
        logger.info("========================================");
        SpringApplication.run(CartApplication.class, args);
        logger.info("========================================");
        logger.info("Cart Service Started Successfully!");
        logger.info("========================================");
    }
}
