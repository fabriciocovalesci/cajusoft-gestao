import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral">
          Sistema de Gestão Municipal
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl">
          Plataforma integrada para gestão eficiente dos recursos e serviços 
          municipais de Pacajus.
        </p>
      </div>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="btn btn-primary"
        >
          Acessar Sistema
        </Link>
        <Link 
          href="/about" 
          className="btn btn-outline btn-secondary"
        >
          Saiba Mais
        </Link>
      </div>
    </div>
  );
}
