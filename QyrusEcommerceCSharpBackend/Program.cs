using Microsoft.EntityFrameworkCore;
using QyrusEcommerceCSharpBackend.Data;
using QyrusEcommerceCSharpBackend.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();

// Configure CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure MySQL-backed persistence. This is the SAME shared `ecommerce` database/schema
// that the Java backend owns via Hibernate (ddl-auto=update) and that Python also reads
// via SQLAlchemy - EF Core here maps directly onto Java's real table/column names so all
// three backends share actual data, not just a server.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=localhost;Port=3307;Database=ecommerce;User=user;Password=password;";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

app.UseCors("AllowAll");

// Initialize Data Store (static product CATEGORY list only - this exactly matches Java's
// hardcoded ProductCategoryService list, so it's safe to keep; the product catalog itself
// is now read live from the shared `products` table, not products_data.json).
DataStore.Initialize(app.Environment.ContentRootPath);

// Defensive, idempotent schema bootstrap: this app does NOT own/migrate the shared schema
// (Java's Hibernate does, via ddl-auto=update), so we never call EnsureCreated()/Migrate()
// against it. These CREATE TABLE IF NOT EXISTS statements mirror Java's own DDL exactly and
// only matter for a from-scratch `dotnet run` before Java has ever started.
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS users (
        id bigint NOT NULL AUTO_INCREMENT,
        age int DEFAULT NULL,
        country varchar(255) DEFAULT NULL,
        email varchar(255) DEFAULT NULL,
        name varchar(255) DEFAULT NULL,
        password varchar(255) DEFAULT NULL,
        phone varchar(255) DEFAULT NULL,
        reset_otp varchar(255) DEFAULT NULL,
        reset_token varchar(255) DEFAULT NULL,
        reset_token_expiry datetime(6) DEFAULT NULL,
        verified bit(1) NOT NULL,
        PRIMARY KEY (id), UNIQUE KEY UK_users_email (email)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS products (
        id bigint NOT NULL AUTO_INCREMENT,
        category varchar(255), description varchar(255), image varchar(255),
        name varchar(255), price double, rating double, subcategory varchar(255),
        PRIMARY KEY (id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS product_sizes (
        product_id bigint NOT NULL, sizes varchar(255),
        KEY FK_product_sizes_product (product_id),
        CONSTRAINT FK_product_sizes_product FOREIGN KEY (product_id) REFERENCES products(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS product_colors (
        product_id bigint NOT NULL, hex varchar(255), name varchar(255),
        KEY FK_product_colors_product (product_id),
        CONSTRAINT FK_product_colors_product FOREIGN KEY (product_id) REFERENCES products(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS product_providers (
        product_id bigint NOT NULL, providers varchar(255),
        KEY FK_product_providers_product (product_id),
        CONSTRAINT FK_product_providers_product FOREIGN KEY (product_id) REFERENCES products(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS product_comments (
        product_id bigint NOT NULL, comments varchar(255),
        KEY FK_product_comments_product (product_id),
        CONSTRAINT FK_product_comments_product FOREIGN KEY (product_id) REFERENCES products(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS cart_items (
        id varchar(255) NOT NULL, color varchar(255), provider varchar(255), quantity int, size varchar(255),
        product_id bigint, user_id bigint, PRIMARY KEY (id),
        KEY FK_cart_items_product (product_id), KEY FK_cart_items_user (user_id),
        CONSTRAINT FK_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT FK_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS favorites (
        id bigint NOT NULL AUTO_INCREMENT, product_id bigint, user_id bigint,
        PRIMARY KEY (id), UNIQUE KEY UK_favorites_user_product (user_id, product_id),
        KEY FK_favorites_product (product_id),
        CONSTRAINT FK_favorites_product FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT FK_favorites_user FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS addresses (
        id varchar(255) NOT NULL, address varchar(255), user_id bigint,
        PRIMARY KEY (id), KEY FK_addresses_user (user_id),
        CONSTRAINT FK_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS orders (
        id varchar(255) NOT NULL, created_at datetime(6), payment_method varchar(255), status varchar(255),
        address_id varchar(255), user_id bigint,
        PRIMARY KEY (id), KEY FK_orders_address (address_id), KEY FK_orders_user (user_id),
        CONSTRAINT FK_orders_address FOREIGN KEY (address_id) REFERENCES addresses(id),
        CONSTRAINT FK_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS order_items (
        id bigint NOT NULL AUTO_INCREMENT, color varchar(255), provider varchar(255), quantity int, size varchar(255),
        order_id varchar(255), product_id bigint,
        PRIMARY KEY (id), KEY FK_order_items_order (order_id), KEY FK_order_items_product (product_id),
        CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
        CONSTRAINT FK_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS verification_tokens (
        token varchar(255) NOT NULL, expiry_date datetime(6), otp varchar(255), used bit(1) NOT NULL,
        user_id bigint, PRIMARY KEY (token), KEY FK_verification_tokens_user (user_id),
        CONSTRAINT FK_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
    )");

    db.Database.ExecuteSqlRaw(@"CREATE TABLE IF NOT EXISTS contacts (
        id bigint NOT NULL AUTO_INCREMENT, comments text NOT NULL, created_at datetime(6) NOT NULL, email varchar(255) NOT NULL,
        PRIMARY KEY (id)
    )");
}

// Register Endpoints
app.MapAuthEndpoints();
app.MapProductEndpoints();
app.MapAccountEndpoints();
app.MapCartEndpoints();
app.MapFavoritesEndpoints();
app.MapAddressEndpoints();
app.MapOrderEndpoints();

// Port 9892; Python backend now runs on 9891, Java on 9893.
app.Run("http://0.0.0.0:9892");
