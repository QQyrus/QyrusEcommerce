package com.ecommerce.repository;

import com.ecommerce.model.CartItem;
import com.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import javax.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, String> {
    List<CartItem> findByUser(User user);
    List<CartItem> findByUserAndSavedForLater(User user, boolean savedForLater);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from CartItem item where item.id = :id")
    Optional<CartItem> findByIdForUpdate(String id);
    void deleteByIdAndUser(String id, User user);
}
