using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class FavoritesEndpoints {
    public static void MapFavoritesEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/add-favorite/", async (AddFavoriteInput req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var product = await db.Products.FirstOrDefaultAsync(p => p.Id == req.ProductId);
            if (product == null) return Results.Json(new { detail = "Product not found" }, statusCode: 404);

            if (!await db.Favorites.AnyAsync(f => f.UserId == user.Id && f.ProductId == req.ProductId)) {
                db.Favorites.Add(new FavoriteEntity { UserId = user.Id, ProductId = req.ProductId });
                await db.SaveChangesAsync();
            }

            var favorites = await db.Favorites.Where(f => f.UserId == user.Id).Select(f => f.ProductId).ToListAsync();
            return Results.Ok(new { message = "Product added to favorites successfully", favorites = favorites });
        });

        app.MapGet("/get-favorites/", async ([FromQuery] string email, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var favorites = await db.Favorites.Where(f => f.UserId == user.Id).Select(f => f.ProductId).ToListAsync();
            return Results.Ok(new { email = email, favorites = favorites });
        });

        app.MapDelete("/remove-favorite/", async (HttpRequest request, AppDbContext db) => {
            var body = await request.ReadFromJsonAsync<AddFavoriteInput>();
            if (body == null) return Results.BadRequest();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == body.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);

            var hasAny = await db.Favorites.AnyAsync(f => f.UserId == user.Id);
            if (!hasAny) return Results.Json(new { detail = "No favorites found for this user" }, statusCode: 404);

            var entity = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == user.Id && f.ProductId == body.ProductId);
            if (entity == null) return Results.Json(new { detail = "Product not found in favorites" }, statusCode: 404);

            db.Favorites.Remove(entity);
            await db.SaveChangesAsync();

            var favorites = await db.Favorites.Where(f => f.UserId == user.Id).Select(f => f.ProductId).ToListAsync();
            return Results.Ok(new { message = "Product removed from favorites successfully", favorites = favorites });
        });
    }
}
