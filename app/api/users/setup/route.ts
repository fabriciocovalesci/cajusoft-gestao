import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/app/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();


    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return NextResponse.json(
        { error: 'Já existe um usuário administrador' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password, // O hook pre-save fará o hash
      role: 'admin',
      active: true,
      phone: "54992436596",
      cpf: "265874126548"
    });

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário admin' },
      { status: 400 }
    );
  }
} 