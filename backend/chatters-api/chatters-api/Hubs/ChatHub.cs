using System.Text.Json;
using chatters_api.Models;
using chatters_api.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;

namespace chatters_api.Hubs;

public interface IChatClient
{
    public Task RecieveMessage(string userName, string message, Sentiment? sentiment);
    public Task ReceiveSentiment(string messageId, Sentiment sentiment);
}

public class ChatHub:Hub<IChatClient>
{
    private readonly IDistributedCache _cache;
    private readonly CognitiveService _cognitiveService;


    public ChatHub(IDistributedCache cache, CognitiveService cognitiveService )
    {
        _cache = cache;
        _cognitiveService = cognitiveService;
    }
public async Task JoinChat(UserConnection connection)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);
        var stringConnection = JsonSerializer.Serialize(connection);
        
        await _cache.SetStringAsync(Context.ConnectionId, stringConnection);
        await Clients.Group(connection.ChatRoom).RecieveMessage("System", $"{connection.UserName} joined to chat", null ); 
    }

    public async Task SendMessage(string message)
    {
        var stringConnection = await _cache.GetAsync(Context.ConnectionId);
        var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);
        
        if (connection is not null)
        {
            var sentiment = await _cognitiveService.AnalyzeSentimentAsync(message);
            
            await Clients
                .Group(connection.ChatRoom)
                .RecieveMessage(connection.UserName, message, sentiment);
            
           
        }
    }
}
