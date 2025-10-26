// Models/Sentiment.cs
namespace chatters_api.Models;

public class Sentiment
{
    public string Label { get; set; } = string.Empty; // "positive", "negative", "neutral", "mixed"
    public double Score { get; set; } // Confidence score (0.0 - 1.0)
}