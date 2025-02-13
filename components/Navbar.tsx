"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Prefeitura de Pacajus
        </Link>
      </div>
      <div className="flex-none">
        {!isLoginPage && (
          <Link href="/login" className="btn btn-primary">
            Acesso 1
          </Link>
        )}
      </div>
    </div>
  );
} 