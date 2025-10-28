using chatters_api.Hubs;
using chatters_api.Services;
using chatters_api.Data; 
using Microsoft.EntityFrameworkCore; 

var builder = WebApplication.CreateBuilder(args);

var endpoint = builder.Configuration["AzureTextAnalytics:Endpoint"];
var key = builder.Configuration["AzureTextAnalytics:Key"];


builder.Services.AddSingleton(new CognitiveService(endpoint, key));


builder.Services.AddStackExchangeRedisCache(options =>
{
    var connection = builder.Configuration.GetConnectionString("Redis");
    options.Configuration = connection;
    options.InstanceName = "chatters_cache_";
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DBConnection")));

builder.Services.AddScoped<ChatService>();



builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                "https://chattersui-a9dbatbfd8hegvf8.polandcentral-01.azurewebsites.net" 
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
builder.Services.AddSignalR();



var app = builder.Build();

app.UseCors();

app.MapHub<ChatHub>("/chat");

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}


app.Run();
