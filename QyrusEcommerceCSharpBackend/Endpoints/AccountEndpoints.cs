using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class AccountEndpoints {
    // Age arrives as a polymorphic JSON value (number, or "" when unset) in the request
    // DTO, but is stored as a real nullable int column on `users` in the shared schema.
    private static int? ParseAgeInput(object age) {
        if (age is JsonElement el) {
            if (el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var i)) return i;
            return null;
        }
        if (age is int i2) return i2;
        if (age is string s && int.TryParse(s, out var i3)) return i3;
        return null;
    }

    public static void MapAccountEndpoints(this IEndpointRouteBuilder app) {
        app.MapGet("/get-account-details/", async ([FromQuery] string email, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user != null) {
                return Results.Ok(new {
                    email = email,
                    name = user.Name ?? "",
                    age = (object?)user.Age ?? "",
                    country = user.Country ?? "",
                    phone = user.Phone ?? ""
                });
            }
            return Results.Json(new { detail = "Account details not found" }, statusCode: 404);
        });

        app.MapPost("/update-account-details/", async (UpdateAccountDetailsRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user != null) {
                user.Name = req.Name;
                user.Phone = req.Phone;
                user.Age = ParseAgeInput(req.Age);
                user.Country = req.Country;
                await db.SaveChangesAsync();
                return Results.Ok(new {
                    message = "Account details updated successfully",
                    updated_details = new AccountDetails { Name = user.Name ?? "", Age = (object?)user.Age ?? "", Country = user.Country ?? "", Phone = user.Phone ?? "" }
                });
            }
            return Results.Json(new { detail = "Account not found" }, statusCode: 404);
        });

        app.MapPost("/record-contact/", async (RecordContactRequest req, AppDbContext db) => {
            db.Contacts.Add(new ContactEntity { Email = req.Email, Comments = req.Comments, CreatedAt = DateTime.UtcNow });
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Contact recorded successfully", email = req.Email });
        });
    }
}
