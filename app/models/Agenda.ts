import { Schema, Document, model } from "mongoose";

export interface IAgenda extends Document {
  adminId: Schema.Types.ObjectId; 
  date: string;
  tipoServico: Schema.Types.ObjectId; 
  horarios: { inicio: string; termino: string }[];
}

const AgendaSchema = new Schema<IAgenda>({
  adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  tipoServico: { type: Schema.Types.ObjectId, ref: "ServiceType", required: true },
  horarios: [
    {
      inicio: { type: String, required: true },
      termino: { type: String, required: true },
    },
  ],
});

export const Agenda = model<IAgenda>("Agenda", AgendaSchema);
