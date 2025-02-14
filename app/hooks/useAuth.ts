import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (requireAuth && !session) {
      console.log('Não autenticado, redirecionando para login');
      router.replace('/login');
    } else if (!requireAuth && session) {
      console.log('Já autenticado, redirecionando para home');
      router.replace('/home');
    } else {
      setIsLoading(false);
    }
  }, [session, status, requireAuth, router]);

  return { session, isLoading, status };
} 