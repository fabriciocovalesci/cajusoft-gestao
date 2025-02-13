'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';

export function Navbar() {
  const { data: session, status } = useSession();

  const homeLink = status === 'authenticated' ? '/home' : '/';

  const handleSignOut = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: '/' 
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md px-4 sm:px-8">
      <div className="flex-1">
        <Link href={homeLink} className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <Image
              src="/logo-prefeitura.png"
              alt="Logo Prefeitura de Pacajus"
              fill
              style={{ objectFit: 'contain' }}
              priority
              className="p-1.5"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-primary leading-tight">
              Prefeitura de Pacajus
            </span>
            <span className="text-sm text-base-content/70 leading-tight">
              Sistema de Gestão
            </span>
          </div>
        </Link>
      </div>
      
      <div className="flex-none gap-2">
        {status === 'authenticated' && session?.user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-200 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaUserCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-medium text-base-content">
                    {session.user.name || 'Usuário'}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {session.user.email}
                  </span>
                </div>
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-sm z-[1] mt-2 p-2 shadow-lg bg-base-100 rounded-box w-60">
              <li className="menu-title px-4 py-2">
                <span className="text-sm font-medium text-base-content/60">
                  Menu do Usuário
                </span>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link href="/dashboard" className="text-base-content hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-base-content hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Perfil
                </Link>
              </li>
              <div className="divider my-0"></div>
              <li>
                <button 
                  onClick={handleSignOut}
                  className="text-error hover:text-error/80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair do Sistema
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="btn btn-primary btn-sm"
          >
            Acessar Sistema
          </Link>
        )}
      </div>
    </div>
  );
} 