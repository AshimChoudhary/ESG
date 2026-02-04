import mongoose, { Schema, Document } from "mongoose";

export interface ISentiment {
  label: "Positive" | "Negative" | "Neutral";
  score: number; // 0 to 1
}

export interface IArticle extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  content: string;
  source: string;
  url: string;
  publishedAt: Date;
  sentiment: ISentiment;
  esgCategory: "Environmental" | "Social" | "Governance";
  createdAt: Date;
}

const ArticleSchema: Schema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  source: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  sentiment: {
    label: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
  },
  esgCategory: {
    type: String,
    enum: ["Environmental", "Social", "Governance"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IArticle>("Article", ArticleSchema);
