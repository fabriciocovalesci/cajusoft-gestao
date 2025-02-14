'use client';

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log('Sessão não autenticada no layout protegido');
      router.replace('/login');
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    console.log('Sem sessão no layout protegido');
    return null;
  }

  return children;
} 