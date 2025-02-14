import { Schema, Document, model } from "mongoose";

export interface IServiceType extends Document {
  name: string; 
  code: string; 
  requiresExtraData?: boolean; 
}

const ServiceTypeSchema = new Schema<IServiceType>({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  requiresExtraData: { type: Boolean, default: false },
});

export const ServiceType = model<IServiceType>("ServiceType", ServiceTypeSchema);
