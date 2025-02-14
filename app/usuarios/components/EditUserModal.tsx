'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { FaTimes, FaSave, FaUserEdit, FaTimesCircle } from 'react-icons/fa';

const userSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['entrevistador', 'secretaria'], {
    required_error: 'Selecione um perfil'
  }),
  active: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  };
}

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as 'entrevistador' | 'secretaria',
      active: user.active,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      toast.success('Usuário atualizado com sucesso!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-2 top-2"
        >
          <FaTimes />
        </button>
        <h3 className="font-bold text-lg text-neutral-900 mb-4">
          <FaUserEdit className="inline-block mr-2" />
          Editar Usuário
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-neutral-900">Nome</span>
            </label>
            <input
              type="text"
              className={`input input-bordered text-neutral-900 placeholder:text-neutral-500 ${
                errors.name ? 'input-error' : ''
              }`}
              placeholder="Digite o nome do usuário"
              {...register('name')}
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.name.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-neutral-900">Email</span>
            </label>
            <input
              type="email"
              className={`input input-bordered text-neutral-900 placeholder:text-neutral-500 ${
                errors.email ? 'input-error' : ''
              }`}
              placeholder="Digite o email do usuário"
              {...register('email')}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.email.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-neutral-900">Perfil</span>
            </label>
            <select
              className={`select select-bordered text-neutral-900 ${
                errors.role ? 'select-error' : ''
              }`}
              {...register('role')}
            >
              <option value="" className="text-neutral-500">Selecione um perfil</option>
              <option value="entrevistador" className="text-neutral-900">Entrevistador</option>
              <option value="secretaria" className="text-neutral-900">Secretaria</option>
            </select>
            {errors.role && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.role.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                {...register('active')}
              />
              <span className="label-text text-neutral-900">Usuário Ativo</span>
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-outline btn-error gap-2"
              onClick={onClose}
            >
              <FaTimesCircle />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <FaSave />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 