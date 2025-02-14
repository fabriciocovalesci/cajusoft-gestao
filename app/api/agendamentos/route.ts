import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Agendamento from '@/app/models/Agendamento';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    // Verifica se já existe agendamento
    const existingAgendamento = await Agendamento.findOne({
      diaAgendamento: new Date(data.diaAgendamento),
      horarioAgendamento: data.horarioAgendamento
    });

    if (existingAgendamento) {
      return NextResponse.json({
        error: 'Já existe um agendamento neste horário',
        existingAgendamento
      }, { status: 409 });
    }

    const agendamento = await Agendamento.create(data);
    
    return NextResponse.json(agendamento, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar agendamento' },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const agendamento = await Agendamento.findByIdAndUpdate(
      data._id,
      data,
      { new: true, runValidators: true }
    );

    if (!agendamento) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(agendamento);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar agendamento' },
      { status: 400 }
    );
  }
} 