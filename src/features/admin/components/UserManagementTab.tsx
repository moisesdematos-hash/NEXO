import React, { useState } from 'react';
import { 
  Users, Shield, Search, UserPlus, Edit3, Trash2, CheckSquare, Square, 
  Download, Filter, Sparkles, Eye, X
} from 'lucide-react';
import { Avatar } from '../../../components/ui/Avatar';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  plan: 'Starter' | 'Família Pro' | 'Business Equipas';
  xpLevel: number;
  joinedDate: string;
  status: 'active' | 'suspended';
  lastActive: string;
  tasksCount: number;
  familyGroup?: string;
}

export const UserManagementTab: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: 'u-1',
      name: 'Administrador Master NEXO',
      email: 'admin@nexo.app',
      role: 'admin',
      plan: 'Família Pro',
      xpLevel: 5,
      joinedDate: '2026-01-10',
      status: 'active',
      lastActive: 'Agora mesmo',
      tasksCount: 142,
      familyGroup: 'Família Master',
    },
    {
      id: 'u-2',
      name: 'Marta Silva',
      email: 'marta.silva@gmail.com',
      role: 'user',
      plan: 'Família Pro',
      xpLevel: 4,
      joinedDate: '2026-02-14',
      status: 'active',
      lastActive: 'Há 15 min',
      tasksCount: 68,
      familyGroup: 'Casa da Marta & Pedro',
    },
    {
      id: 'u-3',
      name: 'Pedro Silva',
      email: 'pedro.silva@gmail.com',
      role: 'user',
      plan: 'Família Pro',
      xpLevel: 3,
      joinedDate: '2026-02-15',
      status: 'active',
      lastActive: 'Há 2 horas',
      tasksCount: 45,
      familyGroup: 'Casa da Marta & Pedro',
    },
    {
      id: 'u-4',
      name: 'Convidado Demonstrativo',
      email: 'guest-session-8923@nexo.local',
      role: 'guest',
      plan: 'Starter',
      xpLevel: 1,
      joinedDate: 'Hoje',
      status: 'active',
      lastActive: 'Há 5 min',
      tasksCount: 12,
    },
  ]);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'guest'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'Starter' | 'Família Pro' | 'Business Equipas'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user' | 'guest'>('user');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Família Pro' | 'Business Equipas'>('Família Pro');

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesPlan && matchesStatus;
  });

  // Checkbox handlers
  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: UserRecord = {
      id: `u-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      plan: newPlan,
      xpLevel: 1,
      joinedDate: 'Hoje',
      status: 'active',
      lastActive: 'Recém-criado',
      tasksCount: 0,
    };

    setUsers([newUser, ...users]);
    setNewName('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUserIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
          : u
      )
    );
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status } : u))
    );
    setSelectedUserIds([]);
  };

  const handleExportCSV = () => {
    const targetUsers = selectedUserIds.length > 0
      ? users.filter((u) => selectedUserIds.includes(u.id))
      : users;
      
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetUsers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `nexo_utilizadores_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & KPI Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 p-6 rounded-3xl border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-600/30 border border-purple-400/30 text-purple-300 shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Gestão Avançada de Utilizadores</h3>
            <p className="text-xs text-slate-300 mt-1">
              Painel completo para controlo de acesso, níveis de XP, convites de família e suspensão de contas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow transition-all flex items-center gap-1.5"
          >
            <Download size={16} />
            <span>Exportar Dados ({selectedUserIds.length > 0 ? selectedUserIds.length : 'Todos'})</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <UserPlus size={16} />
            <span>Novo Utilizador</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Utilizadores</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Contas Ativas</span>
          <div className="text-2xl font-black text-emerald-500 mt-1">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Plano Família Pro</span>
          <div className="text-2xl font-black text-indigo-500 mt-1">
            {users.filter((u) => u.plan === 'Família Pro').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Administradores</span>
          <div className="text-2xl font-black text-purple-500 mt-1">
            {users.filter((u) => u.role === 'admin').length}
          </div>
        </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
              <Filter size={14} />
              <span>Filtros:</span>
            </div>

            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Todas as Roles</option>
              <option value="admin">Administrador</option>
              <option value="user">Utilizador</option>
              <option value="guest">Convidado</option>
            </select>

            <select
              value={planFilter}
              onChange={(e: any) => setPlanFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Todos os Planos</option>
              <option value="Starter">Starter</option>
              <option value="Família Pro">Família Pro</option>
              <option value="Business Equipas">Business Equipas</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none"
            >
              <option value="all">Todos os Estados</option>
              <option value="active">Ativos</option>
              <option value="suspended">Suspensos</option>
            </select>
          </div>

        </div>

        {/* Bulk Action Toolbar if items selected */}
        {selectedUserIds.length > 0 && (
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4 animate-fade-in">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              {selectedUserIds.length} utilizador(es) selecionado(s)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('active')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors"
              >
                Reativar Selecionados
              </button>
              <button
                onClick={() => handleBulkStatusChange('suspended')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
              >
                Suspender Selecionados
              </button>
            </div>
          </div>
        )}

        {/* Main Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <th className="pb-3 w-8">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="pb-3">Utilizador</th>
                <th className="pb-3">Role / Permissão</th>
                <th className="pb-3">Plano &amp; Família</th>
                <th className="pb-3">Evolução XP</th>
                <th className="pb-3">Última Atividade</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-2">
                      <button onClick={() => toggleSelectUser(u.id)} className="p-1">
                        {isSelected ? (
                          <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                            {u.status === 'suspended' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30">
                                Suspenso
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px] block">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border inline-flex items-center gap-1 ${
                          u.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30'
                            : u.role === 'guest'
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30'
                        }`}
                      >
                        <Shield size={12} />
                        <span>{u.role === 'admin' ? 'Administrador' : u.role === 'guest' ? 'Convidado' : 'Utilizador'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{u.plan}</div>
                      {u.familyGroup && (
                        <div className="text-[10px] text-indigo-500 font-medium">{u.familyGroup}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] border border-amber-500/20 inline-flex items-center gap-1">
                        <Sparkles size={12} /> Nível {u.xpLevel}
                      </span>
                    </td>

                    <td className="py-3.5 px-2 text-slate-400 font-mono text-[11px]">
                      {u.lastActive}
                    </td>

                    <td className="py-3.5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Ver Detalhes do Utilizador"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar Utilizador"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspender' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Eliminar Utilizador"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE NEW USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-500" />
                <span>Adicionar Novo Utilizador</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ana Maria"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Endereço de Email</label>
                <input
                  type="email"
                  required
                  placeholder="ana@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Permissão</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="user">Utilizador</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Convidado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Plano Ativo</label>
                  <select
                    value={newPlan}
                    onChange={(e: any) => setNewPlan(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Família Pro">Família Pro</option>
                    <option value="Business Equipas">Business Equipas</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition-colors"
                >
                  Criar Utilizador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 size={20} className="text-blue-500" />
                <span>Editar Utilizador: {editingUser.name}</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Permissão</label>
                  <select
                    value={editingUser.role}
                    onChange={(e: any) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="user">Utilizador</option>
                    <option value="admin">Administrador</option>
                    <option value="guest">Convidado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Plano Ativo</label>
                  <select
                    value={editingUser.plan}
                    onChange={(e: any) => setEditingUser({ ...editingUser, plan: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Família Pro">Família Pro</option>
                    <option value="Business Equipas">Business Equipas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nível de XP ({editingUser.xpLevel})
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={editingUser.xpLevel}
                  onChange={(e) => setEditingUser({ ...editingUser, xpLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition-colors"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Avatar name={viewingUser.name} size="md" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingUser.name}</h3>
                  <span className="text-xs text-slate-400">{viewingUser.email}</span>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Estado da Conta:</span>
                <strong className={viewingUser.status === 'active' ? 'text-emerald-500' : 'text-rose-500'}>
                  {viewingUser.status === 'active' ? '🟢 Ativo' : '🔴 Suspenso'}
                </strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Plano Subscrito:</span>
                <strong className="text-slate-900 dark:text-white">{viewingUser.plan}</strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Tarefas Criadas:</span>
                <strong className="text-indigo-500 font-bold">{viewingUser.tasksCount} tarefas</strong>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Progresso XP:</span>
                <strong className="text-amber-500 font-bold">Nível {viewingUser.xpLevel}</strong>
              </div>
            </div>

            {viewingUser.familyGroup && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs flex justify-between items-center">
                <span className="font-semibold text-indigo-900 dark:text-indigo-200">Grupo de Orçamento Familiar:</span>
                <strong className="text-indigo-600 dark:text-indigo-400">{viewingUser.familyGroup}</strong>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
