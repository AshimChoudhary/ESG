import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SentimentResult {
  label: "Positive" | "Negative" | "Neutral";
  score: number;
}

export interface ESGCategoryResult {
  category: "Environmental" | "Social" | "Governance";
  explanation: string;
}

/**
 * Analyze sentiment of a news article using OpenAI GPT
 */
export const analyzeSentiment = async (
  companyName: string,
  articleText: string,
): Promise<SentimentResult> => {
  try {
    const prompt = `Analyze the sentiment of the following news article about ${companyName}. 
Classify it strictly as Positive, Negative, or Neutral and provide a confidence score between 0 and 1.
Article: ${articleText}

Respond in JSON format: {"label": "Positive|Negative|Neutral", "score": 0.0-1.0}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(result);

    return {
      label: parsed.label || "Neutral",
      score: Math.min(Math.max(parsed.score || 0.5, 0), 1),
    };
  } catch (error: any) {
    console.error("Sentiment analysis error:", error.message);
    // Fallback to neutral if API fails
    return { label: "Neutral", score: 0.5 };
  }
};

/**
 * Categorize article into ESG category using OpenAI GPT
 */
export const categorizeESG = async (
  articleText: string,
): Promise<ESGCategoryResult> => {
  try {
    const prompt = `Categorize the following news article into ONE ESG category only: 
Environmental, Social, or Governance.
Explain briefly why.
Article: ${articleText}

Respond in JSON format: {"category": "Environmental|Social|Governance", "explanation": "brief reason"}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an ESG categorization expert. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(result);

    return {
      category: parsed.category || "Governance",
      explanation: parsed.explanation || "General corporate governance",
    };
  } catch (error: any) {
    console.error("ESG categorization error:", error.message);
    // Fallback to Governance if API fails
    return { category: "Governance", explanation: "Default category" };
  }
};

/**
 * Generate ESG summary for a company based on articles
 */
export const generateESGSummary = async (
  companyName: string,
  articles: string[],
): Promise<string> => {
  try {
    const articlesText = articles.slice(0, 10).join("\n---\n");

    const prompt = `Summarize the key ESG issues for ${companyName} based on the following news articles.
Highlight risks, positive trends, and recurring ESG themes.

Articles:
${articlesText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an ESG analysis expert. Provide clear, concise summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    return (
      completion.choices[0]?.message?.content?.trim() || "No summary available."
    );
  } catch (error: any) {
    console.error("ESG summary generation error:", error.message);
    return "Unable to generate summary at this time.";
  }
};
