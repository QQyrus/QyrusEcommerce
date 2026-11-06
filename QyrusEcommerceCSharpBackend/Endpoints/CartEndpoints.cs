using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class CartEndpoints {
    private static CartItem ToDto(CartItemEntity e) => new CartItem {
        CartItemId = e.Id,
        ProductId = (int)(e.ProductId ?? 0),
        Color = e.Color ?? "",
        Provider = e.Provider ?? "",
        Size = e.Size ?? "",
        Quantity = e.Quantity ?? 0
    };

    public static void MapCartEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/add-to-cart/", async (AddToCartRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var product = await db.Products.FirstOrDefaultAsync(p => p.Id == req.ProductId);
            if (product == null) return Results.Json(new { detail = "Product not found" }, statusCode: 404);

            var entity = new CartItemEntity {
                Id = Guid.NewGuid().ToString(),
                UserId = user.Id,
                ProductId = req.ProductId,
                Color = req.Color,
                Provider = req.Provider,
                Size = req.Size,
                Quantity = req.Quantity
            };
            db.CartItems.Add(entity);
            await db.SaveChangesAsync();

            var cart = (await db.CartItems.Where(c => c.UserId == user.Id).ToListAsync()).Select(ToDto).ToList();
            return Results.Ok(new { message = "Item added to cart successfully", cart = cart });
        });

        app.MapGet("/get-cart/", async ([FromQuery] string email, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var userCart = (await db.CartItems.Where(c => c.UserId == user.Id).ToListAsync()).Select(ToDto).ToList();

            var productIds = userCart.Select(c => (long)c.ProductId).Distinct().ToList();
            var products = await db.Products.Where(p => productIds.Contains(p.Id)).ToListAsync();
            var productsById = products.ToDictionary(p => p.Id);

            var detailedCart = userCart.Select(item => {
                if (productsById.TryGetValue(item.ProductId, out var product)) {
                    item.Name = product.Name;
                    item.Price = (decimal?)product.Price;
                    item.Image = product.Image;
                }
                return item;
            }).ToList();

            return Results.Ok(new { email = email, cart = detailedCart });
        });

        app.MapDelete("/remove-from-cart/", async (HttpRequest request, AppDbContext db) => {
            var body = await request.ReadFromJsonAsync<RemoveFromCartRequest>();
            if (body == null) return Results.BadRequest();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == body.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);

            var userCartEntities = await db.CartItems.Where(c => c.UserId == user.Id).ToListAsync();
            if (userCartEntities.Count == 0) return Results.Json(new { detail = "Cart is empty" }, statusCode: 404);

            var toRemove = userCartEntities.FirstOrDefault(c => c.Id == body.CartItemId);
            if (toRemove == null) return Results.Json(new { detail = "Cart item not found" }, statusCode: 404);

            db.CartItems.Remove(toRemove);
            await db.SaveChangesAsync();

            var cart = (await db.CartItems.Where(c => c.UserId == user.Id).ToListAsync()).Select(ToDto).ToList();
            return Results.Ok(new { message = "Item removed from cart successfully", cart = cart });
        });
    }
}
