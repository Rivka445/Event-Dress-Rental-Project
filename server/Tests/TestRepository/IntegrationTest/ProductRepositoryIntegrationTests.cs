//using Entities;
//using Repositories;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Xunit;

//namespace Tests
//{
//    [Collection("Database Collection")]
//    public class ProductRepositoryIntegrationTests : IClassFixture<DatabaseFixture>, IAsyncLifetime
//    {
//        private readonly WebApiShopContext _dbContext;
//        private readonly ModelRepository _productRepository;

//        public ProductRepositoryIntegrationTests(DatabaseFixture databaseFixture)
//        {
//            _dbContext = databaseFixture.Context;
//            _productRepository = new ProductRepository(_dbContext);
//        }
//        public async Task InitializeAsync()
//        {
//            await ClearDatabase();
//        }
//        public async Task DisposeAsync()
//        {
//            await ClearDatabase();
//        }
//        private async Task ClearDatabase()
//        {
//            _dbContext.ChangeTracker.Clear();
//            // סדר המחיקה קריטי למניעת שגיאות Foreign Key
//            if (_dbContext.OrderItems.Any()) _dbContext.OrderItems.RemoveRange(_dbContext.OrderItems);
//            if (_dbContext.Orders.Any()) _dbContext.Orders.RemoveRange(_dbContext.Orders);
//            if (_dbContext.Products.Any()) _dbContext.Products.RemoveRange(_dbContext.Products);
//            if (_dbContext.Categories.Any()) _dbContext.Categories.RemoveRange(_dbContext.Categories);
//            if (_dbContext.Users.Any()) _dbContext.Users.RemoveRange(_dbContext.Users);
//            _dbContext.SaveChanges();
//        }
//        [Fact]
//        public async Task GetById()
//        {
//            // Arrange
//            var category = new Category
//            {
//                Name = "Books"
//            };
//            await _dbContext.Categories.AddAsync(category);
//            await _dbContext.SaveChangesAsync();

//            var product = new Product
//            {
//                Name = "Product 3",
//                CategoryId = category.Id,
//                Description = "Description for Product 3",
//                Price = 20.0,
//                ImgUrl = "a.png"
//            };

          
//            await _dbContext.Products.AddAsync(product);
//            await _dbContext.SaveChangesAsync();

//            // Act
//            var result = await _productRepository.GetById(category.Id);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(product.Name, result.Name);
//        }

//        [Fact]
//        public async Task GetById_NotFound()
//        {
//            // Arrange
//            // No product with this ID exists

//            // Act
//            var result = await _productRepository.GetById(999); // Assuming 999 does not exist

//            // Assert
//            Assert.Null(result);
//        }

//        [Fact]
//        public async Task GetProducts()
//        {
//            // Arrange
//            var category = new Category { Name = "Electronics" };
//            await _dbContext.Categories.AddAsync(category);
//            await _dbContext.SaveChangesAsync();

//            var product1 = new Product { Name = "Laptop", Description = "High performance laptop", Price = 1200, CategoryId =category.Id, ImgUrl="a.png" };
//            var product2 = new Product { Name = "Smartphone", Description = "Latest model smartphone", Price = 800, CategoryId = category.Id, ImgUrl = "a.png" };
//            var product3 = new Product { Name = "Headphones", Description = "Noise cancelling headphones", Price = 100, CategoryId = category.Id, ImgUrl = "a.png" };

//            await _dbContext.Products.AddRangeAsync(product1, product2, product3);
//            await _dbContext.SaveChangesAsync();

//            // Act
//            var (items, totalCount) = await _productRepository.GetProducts("smart", 50, 1000, new int[] { category.Id });

//            // Assert
//            Assert.NotNull(items);
//            Assert.Single(items);
//            Assert.Equal(1, totalCount);
//            Assert.Equal("Smartphone", items.First().Name); // Verify the returned product is the smartphone
//        }

//        [Fact]
//        public async Task GetProducts_NoProductsFound()
//        {
//            // Arrange
//            var category = new Category { Name = "Electronics" };
//            await _dbContext.Categories.AddAsync(category);
//            await _dbContext.SaveChangesAsync();

//            // Act
//            var (items, totalCount) = await _productRepository.GetProducts("NonExisting", 1000, 2000, new int[] { category.Id });

//            // Assert
//            Assert.NotNull(items);
//            Assert.Empty(items); // Verify that no products are returned
//            Assert.Equal(0, totalCount); // Verify that total count is 0
//        }

//        [Fact]
//        public async Task GetProducts_EmptyCategoryIds()
//        {
//            // Arrange
//            var category = new Category { Name = "Electronics" };
//            await _dbContext.Categories.AddAsync(category);
//            await _dbContext.SaveChangesAsync();

//            var product = new Product { Name = "Tablet", Description = "Latest tablet", Price = 600, CategoryId = category.Id, ImgUrl= "a.png" };

          
//            await _dbContext.Products.AddAsync(product);
//            await _dbContext.SaveChangesAsync();

//            // Act
//            var (items, totalCount) = await _productRepository.GetProducts(null, null, null, new int[] { });

//            // Assert
//            Assert.NotNull(items);
//            Assert.Single(items); // Should return the single product since no filtering is done
//            Assert.Equal(1, totalCount); // There is one product in the test setup
//        }
//    }
//}
