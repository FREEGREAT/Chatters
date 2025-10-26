namespace chatters_api.Models;

public class Sentiment
{
    public string Label { get; set; } // "positive", "negative", "neutral"
    public double Score { get; set; } // Confidence score
}