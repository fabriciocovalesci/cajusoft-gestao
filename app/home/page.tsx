'use client';

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/casa-do-cidadao" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Casa do Cidadão</h2>
            <p className="text-base-content/80">
              Realize cadastro de agendamentos para serviços de 1ª via RG, 2ª via RG e reservista.
            </p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">
                Acessar
              </button>
            </div>
          </div>
        </Link>

        <Link href="/cadastro-unico" className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Cadastro Único</h2>
            <p className="text-base-content/80">
              Realize cadastro de agendamentos para serviços de cadastro único.
            </p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">
                Acessar
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
