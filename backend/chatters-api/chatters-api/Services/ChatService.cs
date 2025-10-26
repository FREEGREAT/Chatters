// Services/ChatService.cs
using chatters_api.Data;
using chatters_api.Models;
using Microsoft.EntityFrameworkCore;


namespace chatters_api.Services
{
    public class ChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SaveMessageAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Message>> GetMessagesForChatRoomAsync(string chatRoom, int count = 50)
        {
            return await _context.Messages
                .Where(m => m.ChatRoom == chatRoom)
                .OrderByDescending(m => m.Timestamp) // Последние сообщения первыми
                .Take(count)
                .ToListAsync();
        }
    }
}