import express from "express";
import {
  searchCompany,
  getCompanyArticles,
  getESGSummary,
  getDashboardData,
  getAllCompanies,
} from "../controllers/companyController";

const router = express.Router();

// Get all companies
router.get("/companies", getAllCompanies);

// Search for a company and fetch ESG news
router.post("/search", searchCompany);

// Get articles for a company
router.get("/companies/:companyId/articles", getCompanyArticles);

// Get ESG summary for a company
router.get("/companies/:companyId/summary", getESGSummary);

// Get dashboard analytics
router.get("/companies/:companyId/dashboard", getDashboardData);

export default router;
