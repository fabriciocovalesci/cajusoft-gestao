'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false
      });

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Ocorreu um erro durante o login');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-neutral text-center mb-8">
            Acesso ao Sistema
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered bg-base-200 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content font-medium">Senha</span>
              </label>
              <input
                type="password"
                name="password"
                className="input input-bordered bg-base-200 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full text-white hover:bg-primary-focus transition-colors duration-300"
            >
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 