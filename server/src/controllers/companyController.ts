import { Request, Response } from "express";
import Company from "../models/Company";
import Article from "../models/Article";
import { fetchESGNews } from "../services/newsService";
import {
  analyzeSentiment,
  categorizeESG,
  generateESGSummary,
} from "../services/aiService";

/**
 * Search for a company and fetch ESG news articles
 * Performs AI sentiment analysis and ESG categorization
 */
export const searchCompany = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyName } = req.body;

    if (!companyName || typeof companyName !== "string") {
      res.status(400).json({ error: "Company name is required" });
      return;
    }

    // Find or create company
    let company = await Company.findOne({ name: companyName });
    if (!company) {
      company = await Company.create({ name: companyName });
    }

    // Fetch news articles
    const newsArticles = await fetchESGNews(companyName);

    if (newsArticles.length === 0) {
      res.json({
        company: company,
        message: "No ESG news found for this company",
        articlesProcessed: 0,
      });
      return;
    }

    // Process each article with AI
    const processedArticles = [];

    for (const newsArticle of newsArticles) {
      try {
        // Combine title and description for analysis
        const articleText = `${newsArticle.title}. ${newsArticle.description}`;

        // AI: Sentiment Analysis
        const sentiment = await analyzeSentiment(companyName, articleText);

        // AI: ESG Categorization
        const esgResult = await categorizeESG(articleText);

        // Check if article already exists
        const existingArticle = await Article.findOne({
          companyId: company._id,
          url: newsArticle.url,
        });

        if (!existingArticle) {
          const article = await Article.create({
            companyId: company._id,
            title: newsArticle.title,
            description: newsArticle.description || "",
            content: newsArticle.content || "",
            source: newsArticle.source.name,
            url: newsArticle.url,
            publishedAt: new Date(newsArticle.publishedAt),
            sentiment: sentiment,
            esgCategory: esgResult.category,
          });

          processedArticles.push(article);
        }
      } catch (error) {
        console.error("Error processing article:", error);
        // Continue with next article
      }
    }

    res.json({
      company: company,
      articlesProcessed: processedArticles.length,
      message: `Successfully processed ${processedArticles.length} new articles`,
    });
  } catch (error: any) {
    console.error("Search company error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * Get all articles for a company with optional filters
 */
export const getCompanyArticles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { sentiment, esgCategory } = req.query;

    const query: any = { companyId };

    if (sentiment) {
      query["sentiment.label"] = sentiment;
    }

    if (esgCategory) {
      query.esgCategory = esgCategory;
    }

    const articles = await Article.find(query).sort({ publishedAt: -1 });

    res.json({ articles });
  } catch (error: any) {
    console.error("Get articles error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * Get ESG summary for a company
 */
export const getESGSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const articles = await Article.find({ companyId })
      .sort({ publishedAt: -1 })
      .limit(10);

    if (articles.length === 0) {
      res.json({ summary: "No articles available for summary generation." });
      return;
    }

    const articleTexts = articles.map((a) => `${a.title}. ${a.description}`);
    const summary = await generateESGSummary(company.name, articleTexts);

    res.json({ summary });
  } catch (error: any) {
    console.error("Get ESG summary error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * Get dashboard analytics for a company
 */
export const getDashboardData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { companyId } = req.params;

    const articles = await Article.find({ companyId }).sort({ publishedAt: 1 });

    // Sentiment trend over time
    const sentimentTrend = articles.map((article) => ({
      date: article.publishedAt.toISOString().split("T")[0],
      sentiment: article.sentiment.label,
      score: article.sentiment.score,
    }));

    // ESG category distribution
    const esgDistribution = {
      Environmental: articles.filter((a) => a.esgCategory === "Environmental")
        .length,
      Social: articles.filter((a) => a.esgCategory === "Social").length,
      Governance: articles.filter((a) => a.esgCategory === "Governance").length,
    };

    res.json({
      sentimentTrend,
      esgDistribution,
      totalArticles: articles.length,
    });
  } catch (error: any) {
    console.error("Get dashboard data error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

/**
 * Get all companies
 */
export const getAllCompanies = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ companies });
  } catch (error: any) {
    console.error("Get companies error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
