import axios from "axios";

export interface NewsArticle {
  title: string;
  description: string;
  content: string;
  source: {
    name: string;
  };
  url: string;
  publishedAt: string;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

/**
 * Fetch ESG-related news articles for a company using NewsAPI
 */
export const fetchESGNews = async (
  companyName: string,
): Promise<NewsArticle[]> => {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    throw new Error("NEWS_API_KEY not configured");
  }

  try {
    // ESG-filtered query
    const query = `${companyName} AND (ESG OR sustainability OR environment OR "social responsibility" OR governance)`;

    const response = await axios.get<NewsAPIResponse>(
      "https://newsapi.org/v2/everything",
      {
        params: {
          q: query,
          apiKey: apiKey,
          language: "en",
          sortBy: "publishedAt",
          pageSize: 20,
        },
      },
    );

    if (response.data.status === "ok") {
      return response.data.articles.filter(
        (article) =>
          article.title && article.description && article.title !== "[Removed]",
      );
    }

    return [];
  } catch (error: any) {
    console.error("NewsAPI Error:", error.response?.data || error.message);
    throw new Error("Failed to fetch news articles");
  }
};
