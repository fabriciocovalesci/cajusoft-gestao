import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { models, model } from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export interface IAgendamento {
  servico: 'Emissão de RG' | 'Emissão de Reservista' | 'Segunda Via de RG';
  horarioAgendamento: string;
  diaAgendamento: Date;
  concluido: boolean;
  naoComparacido: boolean;
}

export type UserRole = 'admin' | 'entrevistador' | 'secretaria';

export interface IUser {
  name: string;
  phone: string;
  cpf: string;
  email: string;
  password: string;
  role: UserRole;
  imageUrl?: string;
  historicoAgendamentos: IAgendamento[];
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends Model<IUser> {
  findByCredentials(email: string, password: string): Promise<IUser>;
}

const agendamentoSchema = new Schema<IAgendamento>({
  servico: { 
    type: String,
    enum: ['Emissão de RG', 'Emissão de Reservista', 'Segunda Via de RG'],
    required: true
  },
  horarioAgendamento: { type: String, required: true },
  diaAgendamento: { type: Date, required: true },
  concluido: { type: Boolean, default: false },
  naoComparacido: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Nome é obrigatório'] 
  },
  phone: { 
    type: String, 
    required: false,
    // match: [/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato de telefone inválido']
  },
  cpf: {
    type: String,
    required: false,
    unique: true,
    // match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'] 
  },
  role: { 
    type: String, 
    enum: ['admin', 'entrevistador', 'secretaria'],
    required: [true, 'Perfil é obrigatório'] 
  },
  imageUrl: { type: String },
  historicoAgendamentos: { 
    type: [agendamentoSchema], 
    default: [],
    validate: {
      validator: (arr: IAgendamento[]) => arr.length <= 20,
      message: 'Limite máximo de 20 agendamentos no histórico'
    }
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  await dbConnect()
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Gerar token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      _id: this._id, 
      role: this.role,
      cpf: this.cpf
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
};

// Método estático para autenticação
userSchema.statics.findByCredentials = async function(email: string, password: string) {
  const user = await this.findOne({ email })
    .select('+password')
    .exec();

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Credenciais inválidas');
  }

  return user;
};

// Índices para melhor performance
userSchema.index({ email: 1, cpf: 1 });

const User = models.User || model<IUser>('User', userSchema, 'users');

export default User;