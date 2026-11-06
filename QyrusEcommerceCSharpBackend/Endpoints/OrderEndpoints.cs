using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class OrderEndpoints {
    private static async Task<Order> ToDtoAsync(AppDbContext db, OrderEntity e) {
        var items = await db.OrderItems.Where(oi => oi.OrderId == e.Id).ToListAsync();
        return new Order {
            OrderId = e.Id,
            AddressId = e.AddressId ?? "",
            Products = items.Select(i => new CartItem {
                ProductId = (int)(i.ProductId ?? 0),
                Color = i.Color ?? "",
                Provider = i.Provider ?? "",
                Size = i.Size ?? "",
                Quantity = i.Quantity ?? 0
            }).ToList(),
            PaymentMethod = e.PaymentMethod ?? "",
            Status = e.Status ?? "",
            CreatedAt = e.CreatedAt?.ToString("o") ?? ""
        };
    }

    public static void MapOrderEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/create-order/", async (CreateOrderRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var hasAddress = await db.Addresses.AnyAsync(a => a.UserId == user.Id && a.Id == req.AddressId);
            if (!hasAddress) return Results.Json(new { detail = "Address not found" }, statusCode: 404);

            foreach (var product in req.Products) {
                if (!await db.Products.AnyAsync(p => p.Id == product.ProductId)) {
                    return Results.Json(new { detail = $"Product with ID {product.ProductId} not found" }, statusCode: 404);
                }
            }

            var orderId = Guid.NewGuid().ToString();
            db.Orders.Add(new OrderEntity {
                Id = orderId,
                UserId = user.Id,
                AddressId = req.AddressId,
                PaymentMethod = req.PaymentMethod,
                Status = "confirmed",
                CreatedAt = DateTime.UtcNow
            });
            foreach (var product in req.Products) {
                db.OrderItems.Add(new OrderItemEntity {
                    OrderId = orderId,
                    ProductId = product.ProductId,
                    Color = product.Color,
                    Provider = product.Provider,
                    Size = product.Size,
                    Quantity = product.Quantity
                });
            }
            await db.SaveChangesAsync();

            return Results.Ok(new { message = "Order created successfully", order_id = orderId, order_status = "confirmed" });
        });

        app.MapGet("/get-orders/", async ([FromQuery] string email, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var orderEntities = await db.Orders.Where(o => o.UserId == user.Id).ToListAsync();
            var orders = new List<Order>();
            foreach (var oe in orderEntities) orders.Add(await ToDtoAsync(db, oe));
            return Results.Ok(new { email = email, orders = orders });
        });

        app.MapPost("/cancel-order/", async (CancelOrderRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var order = await db.Orders.FirstOrDefaultAsync(o => o.UserId == user.Id && o.Id == req.OrderId);
            if (order != null) {
                if (order.Status == "cancelled") return Results.Json(new { detail = "Order already cancelled" }, statusCode: 400);
                order.Status = "cancelled";
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "Order cancelled successfully", order_id = req.OrderId, order_status = "cancelled" });
            }
            return Results.Json(new { detail = "Order not found" }, statusCode: 404);
        });
    }
}
