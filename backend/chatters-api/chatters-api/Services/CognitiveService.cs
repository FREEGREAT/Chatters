using Azure;
using Azure.AI.TextAnalytics;
using chatters_api.Models; 

namespace chatters_api.Services;

public class CognitiveService
{
    private readonly TextAnalyticsClient _client;
    
    public CognitiveService(string endpoint, string key)
    {
        var credential = new AzureKeyCredential(key);
        _client = new TextAnalyticsClient(new Uri(endpoint), credential);
    }

    public async Task<Sentiment> AnalyzeSentimentAsync(string message) 
    {
        var result = await _client.AnalyzeSentimentAsync(message); 

        TextSentiment textSentiment = result.Value.Sentiment;

        SentimentConfidenceScores confidenceScores = result.Value.ConfidenceScores;

        string label = textSentiment.ToString().ToLower(); 
        double score = 0;

        switch (textSentiment)
        {
            case TextSentiment.Positive:
                score = confidenceScores.Positive;
                break;
            case TextSentiment.Negative:
                score = confidenceScores.Negative;
                break;
            case TextSentiment.Neutral:
                score = confidenceScores.Neutral;
                break;
            case TextSentiment.Mixed: 
                label = "neutral"; 
                score = confidenceScores.Neutral; 
                break;
            default:
                label = "neutral"; 
                score = 0;
                break;
        }

        return new Sentiment 
        { 
            Label = label,
            Score = score
        };
    }
}