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
//    public class UserRepositoryIntegrationTests : IClassFixture<DatabaseFixture>, IAsyncLifetime
//    {
//        private readonly WebApiShopContext _dbContext;
//        private readonly UserRepository _userRepository;
//        public UserRepositoryIntegrationTests(DatabaseFixture databaseFixture)
//        {
//            _dbContext = databaseFixture.Context;
//            _userRepository = new UserRipository(_dbContext);
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
//        public async Task AddUser()
//        {
//            // Arrange
//            var newUser = new User
//            {
//                Email = "newuser@example.com",
//                FirstName = "New",
//                LastName = "User",
//                Password = "securepassword"
//            };

//            // Act
//            var result = await _userRepository.AddUser(newUser);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(newUser.Email, result.Email);
//        }

//        [Fact]
//        public async Task GetUserById()
//        {
//            // Arrange
//            var user = new User
//            {
//                Email = "existinguser@example.com",
//                FirstName = "Existing",
//                LastName = "User",
//                Password = "securepassword"
//            };
//            await _dbContext.Users.AddAsync(user);
//            await _dbContext.SaveChangesAsync();


//            // Act
//            var result = await _userRepository.GetUserById(user.Id);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(user.Email, result.Email);
//        }

//        [Fact]
//        public async Task LogIn()
//        {
//            // Arrange
//            var user = new User
//            {
//                Email = "loginuser@example.com",
//                FirstName = "Login",
//                LastName = "User",
//                Password = "securepassword!!!11"
//            };

//            await _userRepository.AddUser(user);
//            var loginUser = new User { Email = "loginuser@example.com", Password = "securepassword!!!11" };

//            // Act
//            var result = await _userRepository.LogIn(loginUser);

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(user.Email, result.Email);
//        }

//        [Fact]
//        public async Task LogIn_InvalidCredentials()
//        {
//            // Arrange
//            // Attempt to log in with incorrect credentials

//            var loginUser = new User { Email = "wronguser@example.com", Password = "wrongpassword!!!!@@@@" };

//            // Act
//            var result = await _userRepository.LogIn(loginUser);

//            // Assert
//            Assert.Null(result);
//        }

//        [Fact]
//        public async Task GetUsers()
//        {
//            // Arrange
//            var user1 = new User
//            {
//                Email = "user1@example.com",
//                FirstName = "User1",
//                LastName = "Test",
//                Password = "password123"
//            };

//            var user2 = new User
//            {
//                Email = "user2@example.com",
//                FirstName = "User2",
//                LastName = "Test",
//                Password = "password123"
//            };

//            await _userRepository.AddUser(user1);
//            await _userRepository.AddUser(user2);

//            // Act
//            var result = await _userRepository.GetUsers();

//            // Assert
//            Assert.NotNull(result);
//            Assert.Equal(2, result.Count);
//        }

//        [Fact]
//        public async Task GetUserById_NotFound()
//        {
//            // Arrange
//            // No user with this ID exists

//            // Act
//            var result = await _userRepository.GetUserById(999); // Assuming 999 does not exist

//            // Assert
//            Assert.Null(result);
//        }
//    }
//}
