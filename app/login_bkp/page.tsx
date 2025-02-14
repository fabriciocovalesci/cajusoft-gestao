'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify';
import Image from 'next/image';
import { Navbar } from "@/app/components/Navbar";


const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error('Credenciais inválidas');
      }

      router.push('/home');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-base-200 mt-14">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src="/logo-prefeitura.png"
                  alt="Logo Prefeitura de Pacajus"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-neutral text-center">
                Sistema de Gestão
              </h1>
              <p className="text-neutral text-center mt-1">
                Prefeitura Municipal de Pacajus
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral">Email</span>
                </label>
                <input
                  type="email"
                  className={`input input-bordered ${
                    errors.email ? 'input-error' : ''
                  }`}
                  {...register('email')}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-neutral">Senha</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password')}
                />
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
