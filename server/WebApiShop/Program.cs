using EventDressRental;
using EventDressRental.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NLog.Web;
using Repositories;
using Services;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseNLog();

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddScoped<IUserPasswordRipository, UserPasswordRipository>();
builder.Services.AddScoped<IUserPasswordService, UserPasswordService>();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

builder.Services.AddScoped<IModelRepository, ModelRepository>();
builder.Services.AddScoped<IModelService, ModelService>();

builder.Services.AddScoped<IDressRepository, DressRepository>();
builder.Services.AddScoped<IDressService, DressService>();

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();

builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddHttpClient();

builder.Services.AddDbContext<EventDressRentalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Home")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["TokenKey"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddControllers();

// Configure Redis distributed cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    // expect configuration key: "Redis:Configuration" (e.g. "localhost:6379")
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? builder.Configuration["Redis:Configuration"] ?? "localhost:6379";
    options.InstanceName = "EventDressRental_";
});

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("PerIpPolicy", httpContext =>
        RateLimitPartition.Get<string>(
            httpContext.Connection.RemoteIpAddress?.ToString()
                ?? httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                ?? "unknown",
            _ => new TokenBucketRateLimiter(new TokenBucketRateLimiterOptions
            {
                TokenLimit = 60,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10,
                ReplenishmentPeriod = TimeSpan.FromSeconds(1),
                TokensPerPeriod = 1,
                AutoReplenishment = true
            })
        )
    );

    options.OnRejected = async (context, ct) =>
    {
        var response = context.HttpContext.Response;
        response.StatusCode = StatusCodes.Status429TooManyRequests;
        response.Headers.RetryAfter = "5";
        await Task.CompletedTask;
    };
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
    };
    c.AddSecurityDefinition("Bearer", securityScheme);

    var securityRequirement = new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    };
    c.AddSecurityRequirement(securityRequirement);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowAngularApp");
app.UseErrorHandling();

app.UseRating();

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
        c.RoutePrefix = ""; 
    });
}

app.MapControllers();

app.Run();