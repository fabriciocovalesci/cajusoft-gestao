'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function NotFound() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      router.push(session ? '/home' : '/login');
    }, 3000);

    return () => clearTimeout(redirectTimeout);
  }, [router, session]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-bold mb-4">
        <span className="text-primary">404</span>
      </h1>
      <h2 className="text-2xl font-semibold mb-2 text-neutral">
        Página não encontrada
      </h2>
      <p className="mb-8 text-neutral">
        A página que você está procurando não existe.
      </p>
      <button
        onClick={() => router.push(session ? '/home' : '/login')}
        className="btn btn-primary"
      >
        Voltar
      </button>
    </div>
  );
} 