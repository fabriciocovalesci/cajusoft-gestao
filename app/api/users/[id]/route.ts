import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/app/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

// Buscar usuário específico


export async function GET(
  req: NextRequest, context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    await dbConnect();
    const user = await User.findById(id, '-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar usuário' },
      { status: 400 }
    );
  }
}

// Atualizar usuário
export async function PUT(
  req: NextRequest, context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    await dbConnect();
    const body = await req.json();

    const user = await User.findByIdAndUpdate(
      id,
      { ...body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar usuário' },
      { status: 400 }
    );
  }
}

// Deletar usuário
export async function DELETE(
  req: NextRequest, context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    await dbConnect();
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Usuário deletado com sucesso' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar usuário' },
      { status: 400 }
    );
  }
} 