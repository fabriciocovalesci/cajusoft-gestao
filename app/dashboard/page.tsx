import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral">Dashboard</h1>
        <div className="text-sm breadcrumbs text-base-content/60">
          <ul>
            <li><a>Home</a></li>
            <li>Dashboard</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Estatístico */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="card-title text-base-content">Usuários</h2>
                <p className="text-2xl font-bold text-primary">123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Adicione mais cards conforme necessário */}
      </div>
    </div>
  );
} 