using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace QyrusEcommerceCSharpBackend.Data;

public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<ProductEntity> Products => Set<ProductEntity>();
    public DbSet<ProductSizeEntity> ProductSizes => Set<ProductSizeEntity>();
    public DbSet<ProductColorEntity> ProductColors => Set<ProductColorEntity>();
    public DbSet<ProductProviderEntity> ProductProviders => Set<ProductProviderEntity>();
    public DbSet<ProductCommentEntity> ProductComments => Set<ProductCommentEntity>();
    public DbSet<CartItemEntity> CartItems => Set<CartItemEntity>();
    public DbSet<FavoriteEntity> Favorites => Set<FavoriteEntity>();
    public DbSet<AddressEntity> Addresses => Set<AddressEntity>();
    public DbSet<OrderEntity> Orders => Set<OrderEntity>();
    public DbSet<OrderItemEntity> OrderItems => Set<OrderItemEntity>();
    public DbSet<VerificationTokenEntity> VerificationTokens => Set<VerificationTokenEntity>();
    public DbSet<ContactEntity> Contacts => Set<ContactEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        // Hibernate maps Java `boolean` fields to MySQL bit(1), not tinyint(1) (which is
        // Pomelo/MySqlConnector's default bool mapping). MySqlConnector surfaces a bit(1)
        // column as a ulong, so we need an explicit value converter + column type so EF
        // Core round-trips it as a bool on the C# side without corrupting the underlying
        // bit column that Java also reads/writes.
        var boolToBit = new ValueConverter<bool, ulong>(
            v => v ? 1UL : 0UL,
            v => v != 0UL);

        modelBuilder.Entity<UserEntity>(e => {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Age).HasColumnName("age");
            e.Property(x => x.Country).HasColumnName("country");
            e.Property(x => x.Email).HasColumnName("email");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Password).HasColumnName("password");
            e.Property(x => x.Phone).HasColumnName("phone");
            e.Property(x => x.ResetOtp).HasColumnName("reset_otp");
            e.Property(x => x.ResetToken).HasColumnName("reset_token");
            e.Property(x => x.ResetTokenExpiry).HasColumnName("reset_token_expiry");
            e.Property(x => x.Verified).HasColumnName("verified").HasColumnType("bit(1)").HasConversion(boolToBit);
            e.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<ProductEntity>(e => {
            e.ToTable("products");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Category).HasColumnName("category");
            e.Property(x => x.Description).HasColumnName("description");
            e.Property(x => x.Image).HasColumnName("image");
            e.Property(x => x.Name).HasColumnName("name");
            e.Property(x => x.Price).HasColumnName("price");
            e.Property(x => x.Rating).HasColumnName("rating");
            e.Property(x => x.Subcategory).HasColumnName("subcategory");
        });

        modelBuilder.Entity<ProductSizeEntity>(e => {
            e.ToTable("product_sizes");
            e.HasNoKey();
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.Sizes).HasColumnName("sizes");
        });

        modelBuilder.Entity<ProductColorEntity>(e => {
            e.ToTable("product_colors");
            e.HasNoKey();
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.Hex).HasColumnName("hex");
            e.Property(x => x.Name).HasColumnName("name");
        });

        modelBuilder.Entity<ProductProviderEntity>(e => {
            e.ToTable("product_providers");
            e.HasNoKey();
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.Providers).HasColumnName("providers");
        });

        modelBuilder.Entity<ProductCommentEntity>(e => {
            e.ToTable("product_comments");
            e.HasNoKey();
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.Comments).HasColumnName("comments");
        });

        modelBuilder.Entity<CartItemEntity>(e => {
            e.ToTable("cart_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Color).HasColumnName("color");
            e.Property(x => x.Provider).HasColumnName("provider");
            e.Property(x => x.Quantity).HasColumnName("quantity");
            e.Property(x => x.Size).HasColumnName("size");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.HasOne<ProductEntity>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne<UserEntity>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<FavoriteEntity>(e => {
            e.ToTable("favorites");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
            e.HasOne<ProductEntity>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne<UserEntity>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<AddressEntity>(e => {
            e.ToTable("addresses");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Address).HasColumnName("address");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.HasOne<UserEntity>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<OrderEntity>(e => {
            e.ToTable("orders");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.PaymentMethod).HasColumnName("payment_method");
            e.Property(x => x.Status).HasColumnName("status");
            e.Property(x => x.AddressId).HasColumnName("address_id");
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.HasOne<AddressEntity>().WithMany().HasForeignKey(x => x.AddressId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne<UserEntity>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<OrderItemEntity>(e => {
            e.ToTable("order_items");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Color).HasColumnName("color");
            e.Property(x => x.Provider).HasColumnName("provider");
            e.Property(x => x.Quantity).HasColumnName("quantity");
            e.Property(x => x.Size).HasColumnName("size");
            e.Property(x => x.OrderId).HasColumnName("order_id");
            e.Property(x => x.ProductId).HasColumnName("product_id");
            // Explicit FK relationships (even without navigation properties) so EF Core's
            // change-tracker/SaveChanges dependency graph inserts the parent `orders` row
            // before the child `order_items` rows in the same SaveChangesAsync call.
            e.HasOne<OrderEntity>().WithMany().HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne<ProductEntity>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<VerificationTokenEntity>(e => {
            e.ToTable("verification_tokens");
            e.HasKey(x => x.Token);
            e.Property(x => x.Token).HasColumnName("token");
            e.Property(x => x.ExpiryDate).HasColumnName("expiry_date");
            e.Property(x => x.Otp).HasColumnName("otp");
            e.Property(x => x.Used).HasColumnName("used").HasColumnType("bit(1)").HasConversion(boolToBit);
            e.Property(x => x.UserId).HasColumnName("user_id");
            e.HasOne<UserEntity>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<ContactEntity>(e => {
            e.ToTable("contacts");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Comments).HasColumnName("comments").HasColumnType("text");
            e.Property(x => x.CreatedAt).HasColumnName("created_at");
            e.Property(x => x.Email).HasColumnName("email");
        });
    }
}
