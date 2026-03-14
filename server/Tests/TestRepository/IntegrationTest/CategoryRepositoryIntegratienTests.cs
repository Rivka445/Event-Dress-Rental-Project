//using Entities;
//using Repositories;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace Tests
//{
//    [Collection("Database Collection")]
//    public class CategoryRepositoryIntegratienTests: IClassFixture<DatabaseFixture>, IAsyncLifetime
//    {
//        private readonly WebApiShopContext _dbContext;
//        private readonly CategoryRepository _categoryRepository;
//        public CategoryRepositoryIntegratienTests(DatabaseFixture databaseFixture)
//        {
//            _dbContext = databaseFixture.Context;
//            _categoryRepository = new CategoryRepository(_dbContext);
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
//        public async Task GetCategories_ReturnsAllCategories()
//        {
//            // Arrange
//            var category1 = new Category {  Name = "Electronics" };
//            var category2 = new Category {  Name = "Books" };

//            _dbContext.Categories.Add(category1);
//            _dbContext.Categories.Add(category2);
//            await _dbContext.SaveChangesAsync();

//            // Act
//            var result = await _categoryRepository.GetCategories();

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(2, result.Count);
//            Assert.Contains(result, c => c.Name == "Electronics");
//            Assert.Contains(result, c => c.Name == "Books");
//        }

//        [Fact]
//        public async Task GetCategories_ReturnsEmptyList()
//        {
//            // Arrange
//            // No categories are added to the database
//            // Act
//            var result = await _categoryRepository.GetCategories();
//            // Assert
//            Assert.NotNull(result);
//            Assert.Empty(result);
//        }
//    }
//}
