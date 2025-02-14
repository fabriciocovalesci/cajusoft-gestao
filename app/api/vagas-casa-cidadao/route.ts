import { NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import dbConnect from '@/lib/dbConnect';
import VagasCasaCidadao from '@/app/models/VagasCasaCidadao';


function gerarIntervalos(horarioInicio: string, horarioTermino: string, vagasPorHorario: number) {
  const intervalos = [];
  const [horaInicio, minutoInicio] = horarioInicio.split(':').map(Number);
  const [horaTermino, minutoTermino] = horarioTermino.split(':').map(Number);

  let horaAtual = horaInicio;
  let minutoAtual = minutoInicio;

  while (
    horaAtual < horaTermino || 
    (horaAtual === horaTermino && minutoAtual < minutoTermino)
  ) {
    const horarioFormatado = `${String(horaAtual).padStart(2, '0')}:${String(minutoAtual).padStart(2, '0')}`;
    
    intervalos.push({
      horario: horarioFormatado,
      vagasDisponiveis: vagasPorHorario
    });

    // Avança 30 minutos
    minutoAtual += 30;
    if (minutoAtual >= 60) {
      minutoAtual = 0;
      horaAtual += 1;
    }
  }

  return intervalos;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const data = await req.json();

    const intervalos = gerarIntervalos(
      data.horarioInicio, 
      data.horarioTermino, 
      data.totalVagas
    );

    // Ajusta a data para timezone SP antes de salvar
    const dataInicioSP = ajustarParaTimezoneSP(new Date(data.dataInicio));

    // Verifica se já existem vagas para esta data e serviço
    const existingVagas = await VagasCasaCidadao.findOne({
      dataInicio: dataInicioSP,
      servico: data.servico
    });

    console.log('Data Início SP:', dataInicioSP);
    console.log('Vagas existentes:', existingVagas);

    if (existingVagas) {
      // Atualiza as vagas existentes
      const vagas = await VagasCasaCidadao.findByIdAndUpdate(
        existingVagas._id,
        {
          ...data,
          dataInicio: dataInicioSP,
          vagasPorHorario: data.totalVagas,
          intervalos
        },
        { new: true, runValidators: true }
      );
      return NextResponse.json(vagas);
    }

    // Cria novas vagas
    const vagas = await VagasCasaCidadao.create({
      ...data,
      dataInicio: dataInicioSP,
      vagasPorHorario: data.totalVagas,
      intervalos
    });
    
    return NextResponse.json(vagas, { status: 201 });
  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerenciar vagas' },
      { status: 400 }
    );
  }
}

// Função auxiliar para ajustar a data para timezone de São Paulo
function ajustarParaTimezoneSP(data: Date): Date {
  return DateTime.fromJSDate(data, { zone: 'utc' }) // Garante que está em UTC
    .setZone('America/Sao_Paulo', { keepLocalTime: true }) // Converte para SP sem alterar a hora local
    .toJSDate(); // Retorna um objeto Date
}


export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const data = searchParams.get('data');

    const dataConsulta = data ? new Date(data) : new Date();
    const dataSP = ajustarParaTimezoneSP(dataConsulta);
    
    const inicioDia = new Date(dataSP);
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date(dataSP);
    fimDia.setHours(23, 59, 59, 999);

    console.log('Data Consulta SP:', dataSP);
    console.log('Início do dia:', inicioDia);
    console.log('Fim do dia:', fimDia);

    // Monta a query base
    const query: any = {
      dataInicio: {
        $gte: inicioDia,
        $lte: fimDia
      }
    };

    const servico = searchParams.get('servico');
    if (servico === 'casacidadao') {
      query.$or = [
        { servico: 'Emissão de RG' },
        { servico: 'Emissão de Reservista' },
        { servico: 'Segunda Via de RG' }
      ];
    } else if (servico) {
      query.servico = servico;
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    const vagas = await VagasCasaCidadao.find(query);
    console.log('Vagas encontradas:', vagas.length);
    
    return NextResponse.json(vagas);

  } catch (error: any) {
    console.error('Erro na API:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar vagas' },
      { status: 400 }
    );
  }
} 