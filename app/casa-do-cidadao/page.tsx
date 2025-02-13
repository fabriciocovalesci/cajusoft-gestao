'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';

const vagasSchema = z.object({
  totalVagas: z.number().min(1, "O total de vagas deve ser maior que 0"),
  dataInicio: z.string().min(1, "A data é obrigatória"),
  horarioInicio: z.string().min(1, "O horário de início é obrigatório"),
  horarioTermino: z.string().min(1, "O horário de término é obrigatório"),
}).refine((data) => {
  const inicio = new Date(`2000-01-01T${data.horarioInicio}`);
  const termino = new Date(`2000-01-01T${data.horarioTermino}`);
  return inicio < termino;
}, {
  message: "O horário de início deve ser menor que o horário de término",
  path: ["horarioInicio"],
});

type VagasFormData = z.infer<typeof vagasSchema>;

// Função auxiliar para gerar horários com intervalo de 30 minutos
const gerarHorarios = (): string[] => {
  const horarios: string[] = [];
  for (let hora = 7; hora <= 17; hora++) {
    ['00', '30'].forEach(minuto => {
      // Não incluir horários após 17:30
      if (hora === 17 && minuto === '30') return;
      horarios.push(`${hora.toString().padStart(2, '0')}:${minuto}`);
    });
  }
  return horarios;
};

export default function CasaDoCidadao() {
  const router = useRouter();
  useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const horarios = gerarHorarios();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VagasFormData>({
    resolver: zodResolver(vagasSchema),
    defaultValues: {
      dataInicio: new Date().toISOString().split('T')[0],
      horarioInicio: '08:00',
      horarioTermino: '17:00',
      totalVagas: 30,
    },
  });

  const onSubmit = async (data: VagasFormData) => {
    try {
      console.log('Dados do formulário:', data);
      
      const vagasExistentes = false;

      if (vagasExistentes) {
        const confirmaAtualizacao = window.confirm(
          "Já existem vagas cadastradas para esta data. Deseja atualizar?"
        );
        if (!confirmaAtualizacao) return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Vagas cadastradas com sucesso!");
      router.push("/home");
    } catch (error) {
      console.error('Erro ao cadastrar vagas:', error);
      toast.error("Erro ao cadastrar vagas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Cadastro de Vagas - Casa do Cidadão
          </h1>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total de Vagas */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaUsers className="text-primary" />
                      Total de Vagas
                    </span>
                  </label>
                  <input
                    type="number"
                    className={`input input-bordered ${errors.totalVagas ? 'input-error' : ''}`}
                    {...register("totalVagas", { valueAsNumber: true })}
                  />
                  {errors.totalVagas && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.totalVagas.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Data */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaCalendarAlt className="text-primary" />
                      Data do Atendimento
                    </span>
                  </label>
                  <input
                    type="date"
                    className={`input input-bordered ${errors.dataInicio ? 'input-error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    {...register("dataInicio")}
                  />
                  {errors.dataInicio && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.dataInicio.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Horário de Início */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaClock className="text-primary" />
                      Horário de Início
                    </span>
                  </label>
                  <select
                    className={`select select-bordered ${errors.horarioInicio ? 'select-error' : ''}`}
                    {...register("horarioInicio")}
                  >
                    {horarios.map((horario) => (
                      <option key={`inicio-${horario}`} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
                  {errors.horarioInicio && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.horarioInicio.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Horário de Término */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <FaClock className="text-primary" />
                      Horário de Término
                    </span>
                  </label>
                  <select
                    className={`select select-bordered ${errors.horarioTermino ? 'select-error' : ''}`}
                    {...register("horarioTermino")}
                  >
                    {horarios.map((horario) => (
                      <option key={`termino-${horario}`} value={horario}>
                        {horario}
                      </option>
                    ))}
                  </select>
                  {errors.horarioTermino && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.horarioTermino.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              <div className="card-actions justify-end mt-8">
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="btn btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    "Salvar Vagas"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
