package com.ecommerce.controller;

import com.ecommerce.dto.FavoriteRequest;
import com.ecommerce.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @PostMapping("/add-favorite")
    public ResponseEntity<Map<String, Object>> addFavorite(@RequestBody FavoriteRequest request) {
        favoriteService.addFavorite(request.getEmail(), request.getProductId());
        List<Long> favorites = favoriteService.getFavorites(request.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product added to favorites successfully");
        response.put("favorites", favorites);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get-favorites")
    public ResponseEntity<Map<String, Object>> getFavorites(@RequestParam String email) {
        List<Long> favorites = favoriteService.getFavorites(email);

        Map<String, Object> response = new HashMap<>();
        response.put("email", email);
        response.put("favorites", favorites);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/remove-favorite")
    public ResponseEntity<Map<String, Object>> removeFavorite(@RequestBody FavoriteRequest request) {
        String email = request.getEmail();
        favoriteService.removeFavorite(email, request.getProductId());
        List<Long> favorites = favoriteService.getFavorites(email);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product removed from favorites successfully");
        response.put("favorites", favorites);
        return ResponseEntity.ok(response);
    }
} 