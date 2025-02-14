import { Schema, Document, model } from "mongoose";

export interface IAppointment extends Document {
  serviceId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  userName: string;
  cpf: string;
  agendaId: Schema.Types.ObjectId; 
  inicio: string;
  termino: string;
  diaAgendamento: string;
  naoCompareceu: boolean;
  metadata?: Record<string, any>;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "ServiceType", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    cpf: { type: String, required: true },
    agendaId: { type: Schema.Types.ObjectId, ref: "Agenda", required: true },
    inicio: { type: String, required: true },
    termino: { type: String, required: true },
    diaAgendamento: { type: String, required: true },
    naoCompareceu: { type: Boolean, default: false },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Appointment = model<IAppointment>("Appointment", AppointmentSchema);
