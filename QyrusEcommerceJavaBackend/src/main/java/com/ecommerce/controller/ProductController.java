package com.ecommerce.controller;

import com.ecommerce.model.Product;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("/get-products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam String category,
            @RequestParam(required = false) String subcategory,
            @RequestParam int page) {
        
        Page<Product> productPage = productService.getProducts(category, subcategory, page);
        
        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total_pages", productPage.getTotalPages());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search-products")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam String query,
            @RequestParam int page) {
        Page<Product> productPage = productService.searchProducts(query, page);
        Map<String, Object> response = new HashMap<>();
        response.put("products", productPage.getContent());
        response.put("total_pages", productPage.getTotalPages());
    }

    @GetMapping("/get-product-details/{productId}")
    public ResponseEntity<Product> getProductDetails(@PathVariable Long productId) {
        Product product = productService.getProductDetails(productId);
        return ResponseEntity.ok(product);
    }
} 
