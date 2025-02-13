'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false
      });

      if (res?.error) {
        setError('root', { message: res.error });
      } else if (res?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('root',  { message: 'Ocorreu um erro durante o login'} );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-6">Login</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">E-mail</span>
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="input input-bordered"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-error text-sm mt-1">{errors.email.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Senha</span>
              </label>
              <input
                type="password"
                placeholder="******"
                className="input input-bordered"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-error text-sm mt-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
