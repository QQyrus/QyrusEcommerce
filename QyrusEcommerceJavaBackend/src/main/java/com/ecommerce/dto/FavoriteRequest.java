package com.ecommerce.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Email;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class FavoriteRequest {
    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Product ID is required")
    @JsonProperty("product_id")
    private Long productId;
}
