package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    @Autowired
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> getProducts(String category, String subcategory, int page) {
        PageRequest pageRequest = PageRequest.of(page - 1, 15);
        
        if (subcategory == null || subcategory.equals("none")) {
            return productRepository.findByCategory(category, pageRequest);
        }
        return productRepository.findByCategoryAndSubcategory(category, subcategory, pageRequest);
    }

    public Page<Product> searchProducts(String query, int page) {
        PageRequest pageRequest = PageRequest.of(page - 1, 15);
        return productRepository.searchByName(query, pageRequest);
    }

    public Product getProductDetails(Long productId) {
        return productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }
} 