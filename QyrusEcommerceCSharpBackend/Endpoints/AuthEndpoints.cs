using QyrusEcommerceCSharpBackend.Models;
using QyrusEcommerceCSharpBackend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace QyrusEcommerceCSharpBackend.Endpoints;

public static class AuthEndpoints {
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app) {
        var group = app.MapGroup("/auth");

        group.MapPost("/login/", async (LoginRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user != null && user.Password == req.Password) {
                return Results.Ok(new { message = "Login successful" });
            }
            return Results.Json(new { detail = "Invalid email or password" }, statusCode: 401);
        });

        group.MapPost("/signup/", async (SignupRequest req, AppDbContext db) => {
            if (await db.Users.AnyAsync(u => u.Email == req.Email)) {
                return Results.Json(new { detail = "Email already registered" }, statusCode: 400);
            }
            var user = new UserEntity { Email = req.Email, Password = req.Password, Verified = false };
            db.Users.Add(user);
            await db.SaveChangesAsync(); // need the generated id for the verification token FK

            var token = Guid.NewGuid().ToString();
            db.VerificationTokens.Add(new VerificationTokenEntity {
                Token = token,
                UserId = user.Id,
                Otp = "123456",
                Used = false
            });
            await db.SaveChangesAsync();
            return Results.Ok(new { message = "Signup successful. Please verify your email.", token });
        });

        group.MapPost("/verify-email/", async (VerifyEmailRequest req, AppDbContext db) => {
            var t = await db.VerificationTokens.FirstOrDefaultAsync(x => x.Token == req.Token);
            if (t != null && !t.Used && t.Otp == req.Otp) {
                var user = await db.Users.FirstOrDefaultAsync(u => u.Id == t.UserId);
                if (user != null) user.Verified = true;
                t.Used = true;
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "Email verified successfully" });
            }
            return Results.Json(new { detail = "Invalid OTP or token" }, statusCode: 400);
        });

        group.MapPost("/forgot-password/", async (ForgotPasswordRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user != null) {
                var token = Guid.NewGuid().ToString();
                user.ResetToken = token;
                user.ResetOtp = "reset123";
                user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "Password reset link sent to your email", token });
            }
            return Results.Json(new { detail = "Email not registered" }, statusCode: 404);
        });

        group.MapPost("/reset-password/", async (ResetPasswordRequest req, AppDbContext db) => {
            var user = await db.Users.FirstOrDefaultAsync(u => u.ResetToken == req.Token);
            if (user != null && user.ResetOtp == req.Otp) {
                user.Password = req.Password;
                user.ResetToken = null;
                user.ResetOtp = null;
                user.ResetTokenExpiry = null;
                await db.SaveChangesAsync();
                return Results.Ok(new { message = "Password reset successfully" });
            }
            return Results.Json(new { detail = "Invalid OTP or token" }, statusCode: 400);
        });
    }
}
