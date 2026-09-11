using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutoStock.Application.Interface
{
    public interface ITokenService
    {
        string CreateToken(
            string userId,
            string fullName,
            string email,
            IList<string> roles);
    }
}
