'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import VagasTable from '../components/VagasTable';
import { FaCalendarAlt, FaSearch } from 'react-icons/fa';

const tiposServico = [
  { 
    id: 'casacidadao', 
    nome: 'Casa do Cidadão',
    servicos: ['Emissão de RG', 'Emissão de Reservista', 'Segunda Via de RG']
  },
  { 
    id: 'cadastrounico', 
    nome: 'Cadastro Único',
    servicos: ['Cadastro Único']
  },
];

export default function Consultas() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscarVagas = async () => {
    setLoading(true);
    try {
      const endpoint = tipoSelecionado === 'casacidadao' 
        ? '/api/vagas-casa-cidadao'
        : '/api/vagas-cadastro-unico';

      const params = new URLSearchParams();
      
      if (dataFiltro) {
        const data = new Date(dataFiltro);
        const dataAjustada = new Date(data.getTime() + data.getTimezoneOffset() * 60000);
        params.append('data', dataAjustada.toISOString().split('T')[0]);
      }
      
      if (tipoSelecionado) {
        params.append('servico', tipoSelecionado);
      }

      console.log('Buscando:', `${endpoint}?${params.toString()}`);

      const response = await fetch(`${endpoint}?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar vagas');
      }

      const data = await response.json();
      console.log('Dados recebidos:', data); // Para debug
      
      setVagas(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (error: any) {
      console.error('Erro ao buscar vagas:', error);
      setVagas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <FaSearch className="text-primary text-xl" />
          <h1 className="text-2xl font-bold text-neutral">
            Consulta de Disponibilidade
          </h1>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Tipo de Serviço</span>
                </label>
                <select
                  className="select select-bordered text-black"
                  value={tipoSelecionado}
                  onChange={(e) => setTipoSelecionado(e.target.value)}
                >
                  <option value="">Todos os serviços</option>
                  {tiposServico.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Data</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered text-black"
                  value={dataFiltro}
                  onChange={(e) => setDataFiltro(e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <button
                  className="btn btn-primary"
                  onClick={buscarVagas}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Buscando...
                    </>
                  ) : (
                    'Buscar'
                  )}
                </button>
              </div>
            </div>

            <VagasTable 
              vagas={vagas} 
              tipo={tipoSelecionado as 'casacidadao' | 'cadastrounico'} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 