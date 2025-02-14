'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Vagas {
  _id: string;
  dataInicio: string;
  horarioInicio: string;
  horarioTermino: string;
  totalVagas: number;
  servico: string;
  intervalos?: {
    horario: string;
    vagasDisponiveis: number;
  }[];
}

interface VagasTableProps {
  vagas: Vagas[];
  tipo: 'casacidadao' | 'cadastrounico';
}

export default function VagasTable({ vagas, tipo }: VagasTableProps) {
  if (!vagas?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-black">Nenhuma vaga encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="text-black">
            <th className="text-black">Data</th>
            <th className="text-black">Horário</th>
            <th className="text-black">Serviço</th>
            <th className="text-black">Total de Vagas</th>
            {tipo === 'casacidadao' && <th className="text-black">Vagas Disponíveis</th>}
          </tr>
        </thead>
        <tbody className="text-black">
          {vagas.map((vaga) => (
            <tr key={vaga._id} className="text-black">
              <td>
                {format(new Date(vaga.dataInicio), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </td>
              <td>{`${vaga.horarioInicio} - ${vaga.horarioTermino}`}</td>
              <td>{vaga.servico}</td>
              <td>{vaga.totalVagas}</td>
              {tipo === 'casacidadao' && (
                <td>
                  {vaga.intervalos?.reduce(
                    (total, intervalo) => total + intervalo.vagasDisponiveis,
                    0
                  ) || 'N/A'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 