'use client';

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from 'next/image';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Verifica se já está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Já autenticado na página de login');
      router.replace('/home');
    }
  }, [status, router]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/home'
      });

      if (result?.error) {
        toast.error("Credenciais inválidas");
        return;
      }

      if (result?.ok) {
        console.log('Login bem sucedido, detalhes:', {
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          windowOrigin: window.location.origin,
          result
        });
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
        window.location.href = `${baseUrl}/home`;
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <span className="label-text font-medium text-neutral-900">Email</span>
            </label>
            <input
              type="email"
              className={`input input-bordered text-neutral-900 placeholder:text-neutral-500 ${
                errors.email ? 'input-error' : ''
              }`}
              placeholder="Digite seu email"
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
              <span className="label-text font-medium text-neutral-900">Senha</span>
            </label>
            <input
              type="password"
              className={`input input-bordered text-neutral-900 placeholder:text-neutral-500 ${
                errors.password ? 'input-error' : ''
              }`}
              placeholder="Digite sua senha"
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

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            <Link 
              href="/" 
              className="btn btn-outline btn-neutral w-full gap-2"
            >
              <FaArrowLeft />
              Voltar ao Início
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 
