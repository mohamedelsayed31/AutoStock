using AutoStock.Application.Interface;
using AutoStock.Application.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AutoStock.API.Services
{
    public class JwtTokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;

        public JwtTokenService(
            IOptions<JwtSettings> jwtOptions)
        {
            _jwtSettings = jwtOptions.Value;
        }

        public string CreateToken(
            string userId,
            string fullName,
            string email,
            IList<string> roles)
        {
            if (string.IsNullOrWhiteSpace(_jwtSettings.Key))
            {
                throw new InvalidOperationException(
                    "JWT signing key is not configured.");
            }

            var claims = new List<Claim>
            {
                new Claim(
                    JwtRegisteredClaimNames.Sub,
                    userId),

                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId),

                new Claim(
                    ClaimTypes.Name,
                    fullName),

                new Claim(
                    ClaimTypes.Email,
                    email),

                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        role));
            }

            var key =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(
                        _jwtSettings.Key));

            var credentials =
                new SigningCredentials(
                    key,
                    SecurityAlgorithms.HmacSha256);

            var expiresAt =
                DateTime.UtcNow.AddMinutes(
                    _jwtSettings.DurationInMinutes);

            var token =
                new JwtSecurityToken(
                    issuer: _jwtSettings.Issuer,
                    audience: _jwtSettings.Audience,
                    claims: claims,
                    expires: expiresAt,
                    signingCredentials: credentials);

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}