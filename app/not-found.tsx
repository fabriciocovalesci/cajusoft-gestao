import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-neutral">Página não encontrada</h2>
          <p className="text-base-content/70">
            Desculpe, a página que você está procurando não existe.
          </p>
        </div>
        <Link 
          href="/" 
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Voltar para Home
        </Link>
      </div>
    </div>
  );
} 