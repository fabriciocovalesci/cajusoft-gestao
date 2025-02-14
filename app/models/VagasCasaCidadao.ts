import mongoose from 'mongoose';
import { Schema, models, model } from 'mongoose';

export interface IVagasCasaCidadao {
  dataInicio: Date;
  horarioInicio: string;
  horarioTermino: string;
  vagasPorHorario: number;
  servico: 'Emissão de RG' | 'Emissão de Reservista' | 'Segunda Via de RG';
  intervalos: {
    horario: string;
    vagasDisponiveis: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const vagasCasaCidadaoSchema = new Schema<IVagasCasaCidadao>({
  dataInicio: {
    type: Date,
    required: true
  },
  horarioInicio: {
    type: String,
    required: true
  },
  horarioTermino: {
    type: String,
    required: true
  },
  vagasPorHorario: {
    type: Number,
    required: true,
    min: 1
  },
  servico: {
    type: String,
    required: true,
    enum: ['Emissão de RG', 'Emissão de Reservista', 'Segunda Via de RG']
  },
  intervalos: [{
    horario: String,
    vagasDisponiveis: Number
  }]
}, {
  timestamps: true
});

// Índice composto para garantir unicidade da data e serviço
vagasCasaCidadaoSchema.index({ dataInicio: 1, servico: 1 }, { unique: true });

export default models.VagasCasaCidadao || model<IVagasCasaCidadao>('VagasCasaCidadao', vagasCasaCidadaoSchema); 