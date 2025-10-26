using System.Text.Json;
using chatters_api.Models;
using chatters_api.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;

namespace chatters_api.Hubs;

public interface IChatClient
{
    public Task RecieveMessage(string userName, string message, string? sentimentLabel, double? sentimentScore);
    public Task ReceiveSentiment(string messageId, Sentiment sentiment);
}

public class ChatHub:Hub<IChatClient>
{
    private readonly IDistributedCache _cache;
    private readonly CognitiveService _cognitiveService;
    private readonly ChatService _chatService;

    public ChatHub(IDistributedCache cache, CognitiveService cognitiveService, ChatService chatService )
    {
        _cache = cache;
        _cognitiveService = cognitiveService;
        _chatService = chatService;
    }
public async Task JoinChat(UserConnection connection)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);
        var stringConnection = JsonSerializer.Serialize(connection);
        
        await _cache.SetStringAsync(Context.ConnectionId, stringConnection);
        await Clients.Group(connection.ChatRoom).RecieveMessage("System", $"{connection.UserName} joined to chat", null, null ); 
        var recentMessages = await _chatService.GetMessagesForChatRoomAsync(connection.ChatRoom);
        foreach (var msg in recentMessages.OrderBy(m => m.Timestamp)) 
        {
            await Clients.Caller.RecieveMessage(msg.UserName, msg.Content, msg.Sentiment, msg.SentimentScore);
        }
    }

    public async Task SendMessage(string message)
    {
        var stringConnection = await _cache.GetAsync(Context.ConnectionId);
        var connection = JsonSerializer.Deserialize<UserConnection>(stringConnection);
        
        if (connection is not null)
        {
            var sentiment = await _cognitiveService.AnalyzeSentimentAsync(message);
            var messageToSave = new Message
            {
                UserName = connection.UserName,
                Content = message,
                ChatRoom = connection.ChatRoom,
                Timestamp = DateTime.UtcNow, 
                Sentiment = sentiment.Label, 
                SentimentScore = sentiment.Score 
            };
            
            await _chatService.SaveMessageAsync(messageToSave);

            
            await Clients
                .Group(connection.ChatRoom)
                .RecieveMessage(connection.UserName, message, messageToSave.Sentiment, messageToSave.SentimentScore);
           
        }
    }
}
