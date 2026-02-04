import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICompany>("Company", CompanySchema);
