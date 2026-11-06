namespace QyrusEcommerceCSharpBackend.Data;

// EF Core persistence entities mapped directly onto the shared MySQL schema that is
// owned/created by the Java (Hibernate) backend. These are NOT migrated or created by
// this app (aside from a defensive CREATE TABLE IF NOT EXISTS at startup that mirrors
// Java's own DDL exactly). Kept separate from Models.cs (API DTOs).

public class UserEntity {
    public long Id { get; set; }
    public int? Age { get; set; }
    public string? Country { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Password { get; set; }
    public string? Phone { get; set; }
    public string? ResetOtp { get; set; }
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }
    public bool Verified { get; set; }
}

public class ProductEntity {
    public long Id { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public string? Name { get; set; }
    public double? Price { get; set; }
    public double? Rating { get; set; }
    public string? Subcategory { get; set; }
}

// The following four "side tables" have no real primary key in Java's schema
// (just a product_id FK column + a value column), so they're mapped as keyless
// entities. They are read-only from the C# side - the product catalog itself is
// owned/written by Java.
public class ProductSizeEntity {
    public long ProductId { get; set; }
    public string? Sizes { get; set; }
}

public class ProductColorEntity {
    public long ProductId { get; set; }
    public string? Hex { get; set; }
    public string? Name { get; set; }
}

public class ProductProviderEntity {
    public long ProductId { get; set; }
    public string? Providers { get; set; }
}

public class ProductCommentEntity {
    public long ProductId { get; set; }
    public string? Comments { get; set; }
}

public class CartItemEntity {
    public string Id { get; set; } = "";
    public string? Color { get; set; }
    public string? Provider { get; set; }
    public int? Quantity { get; set; }
    public string? Size { get; set; }
    public long? ProductId { get; set; }
    public long? UserId { get; set; }
}

public class FavoriteEntity {
    public long Id { get; set; }
    public long? ProductId { get; set; }
    public long? UserId { get; set; }
}

public class AddressEntity {
    public string Id { get; set; } = "";
    public string? Address { get; set; }
    public long? UserId { get; set; }
}

public class OrderEntity {
    public string Id { get; set; } = "";
    public DateTime? CreatedAt { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Status { get; set; }
    public string? AddressId { get; set; }
    public long? UserId { get; set; }
}

public class OrderItemEntity {
    public long Id { get; set; }
    public string? Color { get; set; }
    public string? Provider { get; set; }
    public int? Quantity { get; set; }
    public string? Size { get; set; }
    public string? OrderId { get; set; }
    public long? ProductId { get; set; }
}

public class VerificationTokenEntity {
    public string Token { get; set; } = "";
    public DateTime? ExpiryDate { get; set; }
    public string? Otp { get; set; }
    public bool Used { get; set; }
    public long? UserId { get; set; }
}

public class ContactEntity {
    public long Id { get; set; }
    public string Comments { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string Email { get; set; } = "";
}
