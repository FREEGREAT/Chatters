using chatters_api.Hubs;
using chatters_api.Services;

var builder = WebApplication.CreateBuilder(args);

var endpoint = builder.Configuration["AzureTextAnalytics:Endpoint"];
var key = builder.Configuration["AzureTextAnalytics:Key"];


builder.Services.AddSingleton(new CognitiveService(endpoint, key));


builder.Services.AddStackExchangeRedisCache(options =>
{
    var connection = builder.Configuration.GetConnectionString("Redis");
    options.Configuration = connection;
});

//builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddSignalR();



var app = builder.Build();

app.UseCors();

app.MapHub<ChatHub>("/chat");

app.Run();
