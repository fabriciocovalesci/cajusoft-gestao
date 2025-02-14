'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FaUsers, FaIdCard, FaClipboardList, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VagasTable from '../components/VagasTable';
import { useAuth } from '../hooks/useAuth';

const tiposServico = [
  { id: 'casacidadao', nome: 'Casa do Cidadão' },
  { id: 'cadastrounico', nome: 'Cadastro Único' },
];

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const { isLoading } = useAuth(true);

  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [dataFiltro, setDataFiltro] = useState('');
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  // Apenas mostrar o card de usuários se for admin
  const isAdmin = session?.user?.role === 'admin';

  const buscarVagas = async () => {
    if (!tipoSelecionado || !dataFiltro) {
      return;
    }

    setLoading(true);
    try {
      const endpoint = tipoSelecionado === 'casacidadao' 
        ? '/api/vagas-casa-cidadao'
        : '/api/vagas-cadastro-unico';

      const response = await fetch(
        `${endpoint}?data=${dataFiltro}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar vagas');
      }

      const data = await response.json();
      setVagas(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setVagas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-neutral">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isAdmin && (
          <Link href="/usuarios" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body p-5">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="card-title text-xl text-neutral">
                < FaUser className="inline-block mr-2 text-primary" />
                  Gestão de Usuários
                </h2>
              </div>
              <p className="text-base-content/80 text-sm">
                Gerencie usuários do sistema, crie novos perfis e controle acessos.
              </p>
              <div className="card-actions justify-end mt-3">
                <button className="btn btn-primary btn-sm gap-2">
                  Acessar
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        )}

        <Link href="/casa-do-cidadao" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FaIdCard className="text-2xl text-primary" />
              </div>
              <h2 className="card-title text-xl text-neutral">
                Casa do Cidadão
              </h2>
            </div>
            <p className="text-base-content/80 text-sm">
              Realize cadastro de agendamentos para serviços de 1ª via RG, 2ª via RG e reservista.
            </p>
            <div className="card-actions justify-end mt-3">
              <button className="btn btn-primary btn-sm gap-2">
                Acessar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </Link>

        <Link href="/cadastro-unico" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FaClipboardList className="text-2xl text-primary" />
              </div>
              <h2 className="card-title text-xl text-neutral">
                Cadastro Único
              </h2>
            </div>
            <p className="text-base-content/80 text-sm">
              Realize cadastro de agendamentos para serviços de cadastro único.
            </p>
            <div className="card-actions justify-end mt-3">
              <button className="btn btn-primary btn-sm gap-2">
                Acessar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </Link>

        {/* Card de Consulta de Vagas */}
        <Link href="/consultas" className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <FaCalendarAlt className="text-2xl text-primary" />
              </div>
              <h2 className="card-title text-xl text-neutral">
                Consultar Disponibilidade
              </h2>
            </div>
            <p className="text-base-content/80 text-sm">
              Verifique a disponibilidade de vagas para agendamentos nos serviços disponíveis.
            </p>
            <div className="card-actions justify-end mt-3">
              <button className="btn btn-primary btn-sm gap-2">
                Consultar
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </Link>
      </div>

    
    </div>
  );
}
