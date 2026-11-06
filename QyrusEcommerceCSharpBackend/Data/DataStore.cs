using QyrusEcommerceCSharpBackend.Models;
using System.Text.Json;

namespace QyrusEcommerceCSharpBackend.Data;

public static class DataStore {
    // Note: Users/Accounts/Addresses/Cart/Favorites/Orders now live in MySQL via AppDbContext
    // (see Data/AppDbContext.cs and Data/Entities.cs). This class now only holds the
    // static, read-only product catalog loaded from products_data.json at startup.
    public static List<Product> ProductsDb = new();
    public static Dictionary<string, List<string>> ProductCategories = new();

    public static void Initialize(string contentRootPath) {
        var filePath = Path.Combine(contentRootPath, "products_data.json");
        if (File.Exists(filePath)) {
            var json = File.ReadAllText(filePath);
            var data = JsonSerializer.Deserialize<ProductsData>(json);
            if (data != null) {
                ProductsDb = data.Products;
                ProductCategories = data.Categories;
            }
        }
    }
}
