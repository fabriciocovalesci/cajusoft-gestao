import mongoose from 'mongoose';
import { Schema, models, model } from 'mongoose';

export interface IAgendamento {
  servico: 'Emissão de RG' | 'Emissão de Reservista' | 'Segunda Via de RG';
  horarioAgendamento: string;
  diaAgendamento: Date;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  status: 'agendado' | 'concluido' | 'cancelado' | 'nao_compareceu';
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const agendamentoSchema = new Schema<IAgendamento>({
  servico: {
    type: String,
    required: true,
    enum: ['Emissão de RG', 'Emissão de Reservista', 'Segunda Via de RG']
  },
  horarioAgendamento: {
    type: String,
    required: true
  },
  diaAgendamento: {
    type: Date,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true
  },
  telefone: {
    type: String,
    required: true
  },
  email: String,
  status: {
    type: String,
    enum: ['agendado', 'concluido', 'cancelado', 'nao_compareceu'],
    default: 'agendado'
  },
  observacoes: String
}, {
  timestamps: true
});

// Índice composto para verificar agendamentos no mesmo dia/horário
agendamentoSchema.index({ diaAgendamento: 1, horarioAgendamento: 1 }, { unique: true });

export default models.Agendamento || model<IAgendamento>('Agendamento', agendamentoSchema); 