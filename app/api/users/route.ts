import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/app/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

// Função para gerar senha aleatória
function generatePassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Criar usuário
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verifica se o usuário está autenticado e é admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    // Validar role
    if (!['entrevistador', 'secretaria'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Perfil inválido' },
        { status: 400 }
      );
    }

    // Gerar senha aleatória
    const randomPassword = generatePassword();

    const user = await User.create({
      ...body,
      password: randomPassword // O hook pre-save fará o hash
    });

    // Retornar usuário criado e senha gerada (que deve ser mostrada apenas uma vez)
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      password: randomPassword
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 400 }
    );
  }
}

// Listar usuários
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verifica se o usuário está autenticado e é admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuários' },
      { status: 400 }
    );
  }
} 