using chatters_api.Models;
using Microsoft.AspNetCore.SignalR;

namespace chatters_api.Hubs;

public interface IChatClient
{
    public Task RecieveMessage(string userName, string message);
}

public class ChatHub:Hub<IChatClient>
{
    public async Task JoinChat(UserConnection connection)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, connection.ChatRoom);

        await Clients.Group(connection.ChatRoom).RecieveMessage("System", $"{connection.UserName}");
    }
}