using Entities; 

namespace Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}