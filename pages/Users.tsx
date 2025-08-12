
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { User, UserLevel, Permission, PERMISSIONS } from '../types';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon } from '../constants';
import { useAuth } from '../Auth';

const UserForm: React.FC<{
    onSave: (user: Omit<User, 'id'>) => void;
    onClose: () => void;
    initialData: User | null;
}> = ({ onSave, onClose, initialData }) => {
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [level, setLevel] = useState<UserLevel>('Operador');
    const [permissions, setPermissions] = useState<Permission[]>([]);

    useEffect(() => {
        if (initialData) {
            setEmployeeNumber(initialData.employeeNumber);
            setFullName(initialData.fullName);
            setLevel(initialData.level);
            setPermissions(initialData.permissions);
            setPassword(''); // Password field is cleared for security on edit
        } else {
            setEmployeeNumber('');
            setFullName('');
            setLevel('Operador');
            setPermissions([]);
            setPassword('');
        }
    }, [initialData]);

    const handlePermissionChange = (permissionId: Permission) => {
        setPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeNumber || !fullName || (!initialData && !password)) {
            alert('Por favor, complete todos los campos requeridos, incluyendo la contraseña para nuevos usuarios.');
            return;
        }

        const finalPassword = password || initialData?.password || '';

        onSave({ employeeNumber, password: finalPassword, fullName, level, permissions });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Empleado</label>
                    <input type="text" value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={initialData ? 'Dejar en blanco para no cambiar' : ''} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required={!initialData} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nivel de Usuario</label>
                    <select value={level} onChange={e => setLevel(e.target.value as UserLevel)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        <option className="text-dark-text">Administrador</option>
                        <option className="text-dark-text">Supervisor</option>
                        <option className="text-dark-text">Operador</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Permisos del Usuario</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 border rounded-md max-h-48 overflow-y-auto">
                    {PERMISSIONS.map(p => (
                        <label key={p.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100">
                            <input
                                type="checkbox"
                                checked={permissions.includes(p.id)}
                                onChange={() => handlePermissionChange(p.id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-700">{p.label}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar Usuario</button>
            </div>
        </form>
    );
};

const Users: React.FC = () => {
    const [users, setUsers] = useLocalStorage<User[]>('users', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { hasPermission, currentUser } = useAuth();

    const handleSaveUser = (userData: Omit<User, 'id'>) => {
        if (editingUser) {
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id ? { ...editingUser, ...userData, password: userData.password || editingUser.password } : u
            ));
        } else {
            const newUser: User = {
                id: new Date().toISOString(),
                ...userData
            };
            setUsers(prev => [...prev, newUser]);
        }
        setIsModalOpen(false);
        setEditingUser(null);
    };
    
    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (currentUser?.id === userId) {
            alert("No puedes eliminar tu propio usuario.");
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-dark-text">Gestión de Usuarios</h2>
                {hasPermission('manage_users') && (
                    <button onClick={handleAddNew} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        + Agregar Usuario
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Empleado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre Completo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                            {hasPermission('manage_users') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{user.employeeNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.level}</td>
                                {hasPermission('manage_users') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900" title="Modificar">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900" title="Eliminar" disabled={currentUser?.id === user.id}>
                                            <TrashIcon className={`w-5 h-5 ${currentUser?.id === user.id ? 'text-gray-400' : ''}`} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={hasPermission('manage_users') ? 4 : 3} className="text-center py-4 text-gray-500">No hay usuarios registrados.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {hasPermission('manage_users') && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Modificar Usuario' : 'Agregar Nuevo Usuario'}>
                    <UserForm onSave={handleSaveUser} onClose={() => { setIsModalOpen(false); setEditingUser(null); }} initialData={editingUser} />
                </Modal>
            )}
        </div>
    );
};

export default Users;
