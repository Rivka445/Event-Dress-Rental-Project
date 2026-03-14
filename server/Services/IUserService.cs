using Entities;
using DTOs;
namespace Services
{
    public interface IUserService
    {
        Task<bool> IsUserExistsByUserName(string firstName, string lastName);
        Task<bool> IsExistsUserById(int id);
        Task<AuthenticatedUser> AddUser(UserRegisterDTO user);
        Task<UserDTO> GetUserById(int id);
        Task<List<UserDTO>> GetUsers();
        Task<AuthenticatedUser> LogIn(UserLoginDTO existUser);
        Task UpdateUser(int id, UserRegisterDTO updateUser);
    }
}