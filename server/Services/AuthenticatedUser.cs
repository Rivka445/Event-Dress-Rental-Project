using DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Entities;

namespace Services
{
    public class AuthenticatedUser
    {
        public UserDTO User { get; set; }
        public string Token { get; set; }
    }
}
