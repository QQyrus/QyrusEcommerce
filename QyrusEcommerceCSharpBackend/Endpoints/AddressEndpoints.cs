using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class AddressEndpoints {
    private static List<UserAddress> ToDto(IEnumerable<AddressEntity> entities) =>
        entities.Select(a => new UserAddress { AddressId = a.Id, Address = a.Address ?? "" }).ToList();

    public static void MapAddressEndpoints(this IEndpointRouteBuilder app) {
        app.MapPost("/create-address/", async (CreateAddressRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);

            var addressId = Guid.NewGuid().ToString();
            db.Addresses.Add(new AddressEntity { Id = addressId, UserId = user.Id, Address = req.Address });
            await db.SaveChangesAsync();

            var addresses = ToDto(await db.Addresses.Where(a => a.UserId == user.Id).ToListAsync());
            return Results.Ok(new { message = "Address added successfully", address_id = addressId, addresses = addresses });
        });

        app.MapGet("/get-addresses/", async ([FromQuery] string email, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var addresses = ToDto(await db.Addresses.Where(a => a.UserId == user.Id).ToListAsync());
            return Results.Ok(new { email = email, addresses = addresses });
        });

        app.MapDelete("/delete-address/", async (HttpRequest request, AppDbContext db) => {
            var body = await request.ReadFromJsonAsync<DeleteAddressRequest>();
            if (body == null) return Results.BadRequest();
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == body.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);

            var entity = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == user.Id && a.Id == body.AddressId);
            if (entity == null) return Results.Json(new { detail = "Address not found" }, statusCode: 404);

            db.Addresses.Remove(entity);
            await db.SaveChangesAsync();

            var addresses = ToDto(await db.Addresses.Where(a => a.UserId == user.Id).ToListAsync());
            return Results.Ok(new { message = "Address deleted successfully", addresses = addresses });
        });

        app.MapPut("/update-address/", async (UpdateAddressRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) return Results.Json(new { detail = "User not found" }, statusCode: 404);
            var entity = await db.Addresses.FirstOrDefaultAsync(a => a.UserId == user.Id && a.Id == req.AddressId);
            if (entity != null) {
                entity.Address = req.NewAddress;
                await db.SaveChangesAsync();
                var addresses = ToDto(await db.Addresses.Where(a => a.UserId == user.Id).ToListAsync());
                return Results.Ok(new { message = "Address updated successfully", addresses = addresses });
            }
            return Results.Json(new { detail = "Address not found" }, statusCode: 404);
        });
    }
}
