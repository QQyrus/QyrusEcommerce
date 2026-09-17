package com.ecommerce.service;

import com.ecommerce.dto.CartItemResponse;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.UUID;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public void addToCart(String email, Long productId, String color, String provider, String size, int quantity) {
        log.info("Adding item to cart for user: {}, product: {}", email, productId);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
            
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            
        if (quantity < 1) {
            throw new IllegalArgumentException("Quantity must be at least 1");
        }

        List<CartItem> existingItems = cartItemRepository.findByUserAndSavedForLater(user, false).stream()
            .filter(item -> item.getProduct().getId().equals(productId) && matchesVariant(item, color, provider, size))
            .collect(Collectors.toList());
            
        if (!existingItems.isEmpty()) {
            // Update quantity of existing item
            CartItem existingItem = existingItems.get(0);
            existingItem.setQuantity(addQuantity(existingItem.getQuantity(), quantity));
            cartItemRepository.save(existingItem);
            log.info("Updated quantity of existing cart item");
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setId(UUID.randomUUID().toString());
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setColor(color);
            cartItem.setProvider(provider);
            cartItem.setSize(size);
            cartItem.setQuantity(quantity);
            
            cartItemRepository.save(cartItem);
            log.info("Added new item to cart with id: {}", cartItem.getId());
        }
    }

    @Transactional
    public void removeFromCart(String email, String cartItemId) {
        if (email == null || cartItemId == null) {
            throw new IllegalArgumentException("Email and cartItemId must not be null");
        }

        log.info("Attempting to remove cart item: {} for user: {}", cartItemId, email);
        
        CartItem cartItem = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("Cart item does not belong to user");
        }

        if (cartItem.isSavedForLater()) {
            throw new ResourceNotFoundException("Cart item is saved for later");
        }

        cartItemRepository.delete(cartItem);
        cartItemRepository.flush();
        log.info("Successfully removed item from cart");
    }

    public List<CartItemResponse> getCartItems(String email) {
        log.info("Fetching cart for user {}", email);
        User user = getUser(email);
        return cartItemRepository.findByUserAndSavedForLater(user, false).stream()
            .map(this::convertToCartItemResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getSavedCartItems(String email) {
        User user = getUser(email);
        return cartItemRepository.findByUserAndSavedForLater(user, true).stream()
            .map(this::convertToCartItemResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void saveCartItem(String email, String cartItemId) {
        CartItem item = getOwnedCartItem(email, cartItemId);
        if (item.isSavedForLater()) {
            throw new ResourceNotFoundException("Cart item is already saved for later");
        }
        item.setSavedForLater(true);
        cartItemRepository.save(item);
    }

    @Transactional
    public void restoreCartItem(String email, String cartItemId) {
        CartItem savedItem = getOwnedCartItem(email, cartItemId);
        if (!savedItem.isSavedForLater()) {
            throw new ResourceNotFoundException("Saved cart item not found");
        }
        List<CartItem> matchingItems = cartItemRepository
            .findByUserAndSavedForLater(savedItem.getUser(), false).stream()
            .filter(item -> item.getProduct().getId().equals(savedItem.getProduct().getId())
                && matchesVariant(item, savedItem.getColor(), savedItem.getProvider(), savedItem.getSize()))
            .collect(Collectors.toList());
        if (matchingItems.isEmpty()) {
            savedItem.setSavedForLater(false);
            cartItemRepository.save(savedItem);
            return;
        }
        CartItem activeItem = matchingItems.get(0);
        activeItem.setQuantity(addQuantity(activeItem.getQuantity(), savedItem.getQuantity()));
        cartItemRepository.save(activeItem);
        cartItemRepository.delete(savedItem);
    }

    @Transactional
    public void removeSavedCartItem(String email, String cartItemId) {
        CartItem item = getOwnedCartItem(email, cartItemId);
        if (!item.isSavedForLater()) {
            throw new ResourceNotFoundException("Saved cart item not found");
        }
        cartItemRepository.delete(item);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private CartItem getOwnedCartItem(String email, String cartItemId) {
        User user = getUser(email);
        CartItem item = cartItemRepository.findByIdForUpdate(cartItemId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Cart item does not belong to user");
        }
        return item;
    }

    private boolean matchesVariant(CartItem item, String color, String provider, String size) {
        return equalsIgnoreCase(item.getColor(), color)
            && equalsIgnoreCase(item.getProvider(), provider)
            && equalsIgnoreCase(item.getSize(), size);
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return Objects.equals(normalize(left), normalize(right));
    }

    private String normalize(String value) {
        return value == null ? null : value.toLowerCase();
    }

    private int addQuantity(int current, int additional) {
        try {
            return Math.addExact(current, additional);
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException("Quantity is too large");
        }
    }

    private CartItemResponse convertToCartItemResponse(CartItem cartItem) {
        Product product = productRepository.findById(cartItem.getProduct().getId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            
        return CartItemResponse.builder()
            .cartItemId(cartItem.getId())
            .productId(product.getId())
            .name(product.getName())
            .price(product.getPrice())
            .image(product.getImage())
            .color(cartItem.getColor())
            .provider(cartItem.getProvider())
            .size(cartItem.getSize())
            .quantity(cartItem.getQuantity())
            .build();
    }
}
