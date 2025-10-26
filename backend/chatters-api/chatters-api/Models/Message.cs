// Models/Message.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace chatters_api.Models
{
    public class Message
    {
        public int Id { get; set; } 

        [Required]
        [StringLength(256)] 
        public string UserName { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)] 
        public string Content { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow; 
        
        [StringLength(50)] 
        public string? Sentiment { get; set; } // Например, "Positive", "Negative", "Neutral", "Mixed"
        
        public double? SentimentScore { get; set; } // Оценка настроения (например, 0.0 - 1.0)

        [Required]
        [StringLength(100)]
        public string ChatRoom { get; set; } = string.Empty;
    }
}