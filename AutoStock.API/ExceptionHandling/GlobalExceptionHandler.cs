using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AutoStock.API.ExceptionHandling
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;


        public GlobalExceptionHandler(
            ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }


        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(
                exception,
                "An unhandled exception occurred while processing the request.");


            var problemDetails = new ProblemDetails
            {
                Status = StatusCodes
                    .Status500InternalServerError,

                Title = "Internal Server Error",

                Detail =
                    "An unexpected error occurred. Please try again later.",

                Instance = httpContext.Request.Path
            };


            problemDetails.Extensions["traceId"] =
                httpContext.TraceIdentifier;


            httpContext.Response.StatusCode =
                StatusCodes.Status500InternalServerError;

            httpContext.Response.ContentType =
                "application/problem+json";


            await httpContext.Response.WriteAsJsonAsync(
                problemDetails,
                cancellationToken);


            return true;
        }
    }
}