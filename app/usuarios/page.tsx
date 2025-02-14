'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaUser, 
  FaEnvelope, 
  FaUserTag, 
  FaCalendarAlt 
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export default function UsuariosPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar usuários');
      }

      setUsers(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir usuário');
      }

      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral">
          <FaUser className="inline-block mr-2" />
          Gestão de Usuários
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <FaUserPlus />
          Novo Usuário
        </button>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body p-4">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="text-neutral-900">
                <th className="w-[25%]">
                  <FaUser className="inline-block mr-2" />
                  Nome
                </th>
                <th className="w-[25%]">
                  <FaEnvelope className="inline-block mr-2" />
                  Email
                </th>
                <th className="w-[15%]">
                  <FaUserTag className="inline-block mr-2" />
                  Perfil
                </th>
                <th className="w-[10%]">Status</th>
                <th className="w-[15%]">
                  <FaCalendarAlt className="inline-block mr-2" />
                  Criado em
                </th>
                <th className="w-[10%]">Ações</th>
              </tr>
            </thead>
            <tbody className="text-neutral-900">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="max-w-0 truncate">{user.name}</td>
                  <td className="max-w-0 truncate">{user.email}</td>
                  <td>
                    <span className="badge badge-primary text-white">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.active ? 'badge-success' : 'badge-error'
                      } text-white`}
                    >
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-sm btn-primary btn-outline gap-1"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="btn btn-sm btn-error btn-outline gap-1"
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
} 