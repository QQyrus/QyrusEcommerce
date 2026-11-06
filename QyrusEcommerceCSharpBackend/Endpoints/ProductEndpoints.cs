using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class ProductEndpoints {
    // Builds full Product DTOs (with sizes/colors/providers/comments) for a given set of
    // product ids, preserving the exact response shape the API previously returned from
    // the static products_data.json catalog.
    private static async Task<List<Product>> BuildDtosAsync(AppDbContext db, List<ProductEntity> products) {
        var ids = products.Select(p => p.Id).ToList();
        if (ids.Count == 0) return new List<Product>();

        var sizes = await db.ProductSizes.Where(s => ids.Contains(s.ProductId)).ToListAsync();
        var colors = await db.ProductColors.Where(c => ids.Contains(c.ProductId)).ToListAsync();
        var providers = await db.ProductProviders.Where(pr => ids.Contains(pr.ProductId)).ToListAsync();
        var comments = await db.ProductComments.Where(c => ids.Contains(c.ProductId)).ToListAsync();

        var sizesByProduct = sizes.GroupBy(s => s.ProductId).ToDictionary(g => g.Key, g => g.Select(s => s.Sizes ?? "").ToList());
        var colorsByProduct = colors.GroupBy(c => c.ProductId).ToDictionary(g => g.Key, g => g.Select(c => (object)new { name = c.Name, hex = c.Hex }).ToList());
        var providersByProduct = providers.GroupBy(p => p.ProductId).ToDictionary(g => g.Key, g => g.Select(p => p.Providers ?? "").ToList());
        var commentsByProduct = comments.GroupBy(c => c.ProductId).ToDictionary(g => g.Key, g => g.Select(c => c.Comments ?? "").ToList());

        return products.Select(p => new Product {
            Id = (int)p.Id,
            Name = p.Name ?? "",
            Price = (decimal)(p.Price ?? 0),
            Image = p.Image ?? "",
            Category = p.Category ?? "",
            Subcategory = p.Subcategory ?? "",
            Sizes = sizesByProduct.TryGetValue(p.Id, out var sz) ? sz : new List<string>(),
            Colors = colorsByProduct.TryGetValue(p.Id, out var cl) ? cl : new List<object>(),
            Providers = providersByProduct.TryGetValue(p.Id, out var pv) ? pv : new List<string>(),
            Description = p.Description,
            Rating = p.Rating.HasValue ? (int)Math.Round(p.Rating.Value) : null,
            Comments = commentsByProduct.TryGetValue(p.Id, out var cm) ? cm : new List<string>()
        }).ToList();
    }

    public static void MapProductEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet("/get-products/", async ([FromQuery] string category, [FromQuery] string? subcategory, [FromQuery] int page, AppDbContext db) => {
            var query = db.Products.Where(p => p.Category != null && p.Category.ToLower() == category.ToLower());
            if (!string.IsNullOrEmpty(subcategory) && !subcategory.Equals("none", StringComparison.OrdinalIgnoreCase)) {
                query = query.Where(p => p.Subcategory != null && p.Subcategory.ToLower() == subcategory.ToLower());
            }

            var filtered = await query.OrderBy(p => p.Id).ToListAsync();

            var pageSize = 15;
            var start = (page - 1) * pageSize;
            var totalPages = (filtered.Count + pageSize - 1) / pageSize;
            var paginatedEntities = filtered.Skip(start).Take(pageSize).ToList();
            var paginated = await BuildDtosAsync(db, paginatedEntities);

            return Results.Ok(new { products = paginated, total_pages = totalPages });
        });

        app.MapGet("/search-products/", async ([FromQuery] string query, AppDbContext db) => {
            var filteredEntities = await db.Products.Where(p => p.Name != null && p.Name.ToLower().Contains(query.ToLower())).ToListAsync();
            var filtered = await BuildDtosAsync(db, filteredEntities);
            return Results.Ok(new { products = filtered });
        });

        app.MapGet("/get-product-categories/", () => {
            return Results.Ok(new { categories = DataStore.ProductCategories });
        });

        app.MapGet("/get-product-details/{productId}", async (int productId, AppDbContext db) => {
            var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId);
            if (product != null) {
                var dtos = await BuildDtosAsync(db, new List<ProductEntity> { product });
                return Results.Ok(dtos[0]);
            }
            return Results.Json(new { detail = "Product not found" }, statusCode: 404);
        });
    }
}
