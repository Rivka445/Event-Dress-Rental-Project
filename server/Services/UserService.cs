using AutoMapper;
using Entities;
using DTOs;
using Repositories;
namespace Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserPasswordService _userPasswordService;
        private readonly IMapper _mapper;
        private readonly ITokenService _tokenService;
        public UserService(IUserRepository userRepository, IMapper mapper, IUserPasswordService userPasswordService , ITokenService tokenService)
        {
            _userRepository = userRepository;
            _userPasswordService = userPasswordService;
            _mapper = mapper;
            _tokenService = tokenService;
        }
        public async Task<bool> IsUserExistsByUserName(string firstName, string lastName)
        {
            return await _userRepository.IsUserExistsByUserName(firstName, lastName);
        }
        public async Task<bool> IsExistsUserById(int id)
        {
            return await _userRepository.IsExistsUserById(id);
        }
        public bool CheckUser(int id)
        {
            return true;
        }
        public async Task<List<UserDTO>> GetUsers()
        {
            List<User> users = await _userRepository.GetUsers();
            List<UserDTO> usersDTO = _mapper.Map<List<User>, List<UserDTO>>(users);
            return usersDTO;
        }
        public async Task<UserDTO> GetUserById(int id)
        {
            User? user= await _userRepository.GetUserById(id);
            if (user == null)
                return null;
            UserDTO userDTO = _mapper.Map<User, UserDTO>(user);
            return userDTO;
        }
        public async Task<AuthenticatedUser> AddUser(UserRegisterDTO newUser)
        {
            User userRegister = _mapper.Map<UserRegisterDTO, User>(newUser);
            User user = await _userRepository.AddUser(userRegister);
            var token = _tokenService.CreateToken(user);
            UserDTO userDTO = _mapper.Map<User, UserDTO>(user);
            AuthenticatedUser authenticatedUser = new()
            {
                User = userDTO,
                Token = token
            };
            return authenticatedUser;
        }
        public async Task<AuthenticatedUser> LogIn(UserLoginDTO existUser)
        {
            User loginUser = _mapper.Map<UserLoginDTO,User>(existUser);
            User? user = await _userRepository.LogIn(loginUser);
            if (user == null)
                return null;
            UserDTO userDTO = _mapper.Map<User, UserDTO>(user);
            var token = _tokenService.CreateToken(user);
            AuthenticatedUser authenticatedUser = new()
            {
                User=userDTO,
                Token=token
            };
            return authenticatedUser;
        }

        public async Task UpdateUser(int id, UserRegisterDTO updateUser)
        {
            User user = _mapper.Map<UserRegisterDTO, User>(updateUser);
            user.Id = id;
            await _userRepository.UpdateUser(user);
        }
    }
}
