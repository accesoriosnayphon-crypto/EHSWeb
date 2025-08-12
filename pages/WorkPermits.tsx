import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { WorkPermit, User, Jha, WorkPermitType, WORK_PERMIT_TYPES, WorkPermitStatus, WORK_PERMIT_STATUSES } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '../constants';
import WorkPermitDocument from '../components/WorkPermitDocument';

// Form to add/edit a work permit
const WorkPermitForm: React.FC<{
    onSave: (permit: Omit<WorkPermit, 'id' | 'folio'> | WorkPermit) => void;
    onClose: () => void;
    initialData: WorkPermit | null;
    users: User[];
    jhas: Jha[];
    currentUser: User;
}> = ({ onSave, onClose, initialData, users, jhas, currentUser }) => {
    const [formState, setFormState] = useState<Omit<WorkPermit, 'id' | 'folio'>>({
        title: initialData?.title || '',
        type: initialData?.type || 'Trabajo en Altura',
        status: initialData?.status || 'Solicitado',
        requestDate: initialData?.requestDate || new Date().toISOString().split('T')[0],
        requesterUserId: initialData?.requesterUserId || currentUser.id,
        description: initialData?.description || '',
        location: initialData?.location || '',
        equipment: initialData?.equipment || [],
        ppe: initialData?.ppe || [],
        jhaId: initialData?.jhaId || '',
        validFrom: initialData?.validFrom || '',
        validTo: initialData?.validTo || '',
        notes: initialData?.notes || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value.split('\n').filter(item => item.trim() !== '') }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...initialData, ...formState });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Permiso</label>
                <input id="title" name="title" type="text" value={formState.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Permiso</label>
                    <select id="type" name="type" value={formState.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required>
                        {WORK_PERMIT_TYPES.map(t => <option key={t} value={t} className="text-dark-text">{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Ubicación Específica</label>
                    <input id="location" name="location" type="text" value={formState.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">Válido Desde</label>
                    <input id="validFrom" name="validFrom" type="datetime-local" value={formState.validFrom} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="validTo" className="block text-sm font-medium text-gray-700">Válido Hasta</label>
                    <input id="validTo" name="validTo" type="datetime-local" value={formState.validTo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción Detallada del Trabajo</label>
                <textarea id="description" name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipo a Utilizar (uno por línea)</label>
                    <textarea id="equipment" name="equipment" value={formState.equipment.join('\n')} onChange={handleArrayChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="ppe" className="block text-sm font-medium text-gray-700">EPP Requerido (uno por línea)</label>
                    <textarea id="ppe" name="ppe" value={formState.ppe.join('\n')} onChange={handleArrayChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                <label htmlFor="jhaId" className="block text-sm font-medium text-gray-700">JHA Vinculado (Opcional)</label>
                <select id="jhaId" name="jhaId" value={formState.jhaId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                    <option value="" className="text-gray-500">Ninguno</option>
                    {jhas.map(j => <option key={j.id} value={j.id} className="text-dark-text">{j.title} ({j.area})</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar Permiso</button>
            </div>
        </form>
    );
};


const WorkPermits: React.FC = () => {
    const [permits, setPermits] = useLocalStorage<WorkPermit[]>('work_permits', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const [jhas] = useLocalStorage<Jha[]>('jhas', []);
    const { currentUser, hasPermission } = useAuth();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [editingPermit, setEditingPermit] = useState<WorkPermit | null>(null);
    const [viewingPermit, setViewingPermit] = useState<WorkPermit | null>(null);

    const handleSavePermit = (data: Omit<WorkPermit, 'id' | 'folio'> | WorkPermit) => {
        if ('id' in data && data.id) { // Editing
            setPermits(prev => prev.map(p => p.id === data.id ? data as WorkPermit : p));
        } else { // Creating
            const lastFolioNumber = permits.reduce((max, p) => {
                const num = parseInt(p.folio.split('-')[1], 10);
                return num > max ? num : max;
            }, 0);
            const newFolio = `PT-${String(lastFolioNumber + 1).padStart(4, '0')}`;
            const newPermit: WorkPermit = {
                ...data,
                id: new Date().toISOString(),
                folio: newFolio,
            } as WorkPermit;
            setPermits(prev => [newPermit, ...prev]);
        }
        setIsFormOpen(false);
        setEditingPermit(null);
    };

    const handleOpenForm = (permit: WorkPermit | null) => {
        setEditingPermit(permit);
        setIsFormOpen(true);
    };
    
    const handleOpenDocument = (permit: WorkPermit) => {
        setViewingPermit(permit);
        setIsDocumentOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('¿Estás seguro de eliminar este permiso de trabajo?')) {
            setPermits(prev => prev.filter(p => p.id !== id));
        }
    };
    
    const handleStatusChange = (id: string, status: WorkPermitStatus) => {
        setPermits(prev => prev.map(p => {
            if (p.id === id) {
                const updatedPermit = { ...p, status };
                if (status === 'Aprobado') updatedPermit.approverUserId = currentUser!.id;
                if (status === 'Cerrado') {
                    updatedPermit.closerUserId = currentUser!.id;
                    updatedPermit.closeDate = new Date().toISOString().split('T')[0];
                }
                if (status === 'Rechazado') updatedPermit.approverUserId = currentUser!.id;
                return updatedPermit;
            }
            return p;
        }));
    };

    const getUserName = (id?: string) => users.find(u => u.id === id)?.fullName || 'N/A';
    
    const getStatusClass = (status: WorkPermitStatus) => {
        switch(status) {
            case 'Aprobado': return 'bg-green-100 text-green-800';
            case 'En Progreso': return 'bg-blue-100 text-blue-800';
            case 'Cerrado': return 'bg-gray-500 text-white';
            case 'Rechazado': return 'bg-red-100 text-red-800';
            case 'Solicitado': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-dark-text">Permisos de Trabajo de Alto Riesgo</h2>
                {hasPermission('manage_work_permits') && (
                    <button onClick={() => handleOpenForm(null)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        + Nuevo Permiso
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Solicitud</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {permits.map(permit => (
                            <tr key={permit.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{permit.folio}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permit.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{permit.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(permit.requestDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getUserName(permit.requesterUserId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(permit.status)}`}>{permit.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                     <button onClick={() => handleOpenDocument(permit)} className="text-gray-600 hover:text-primary" title="Ver Documento"><ClipboardDocumentListIcon className="w-5 h-5"/></button>
                                     {permit.status === 'Solicitado' && currentUser?.level !== 'Operador' && (
                                         <button onClick={() => handleStatusChange(permit.id, 'Aprobado')} className="text-green-600 hover:text-green-900" title="Aprobar"><CheckCircleIcon className="w-5 h-5"/></button>
                                     )}
                                     {hasPermission('manage_work_permits') && permit.status !== 'Cerrado' && (
                                        <>
                                            <button onClick={() => handleOpenForm(permit)} className="text-indigo-600 hover:text-indigo-900" title="Editar"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete(permit.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                                        </>
                                     )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingPermit ? 'Editar Permiso de Trabajo' : 'Crear Permiso de Trabajo'}>
                {currentUser && <WorkPermitForm onSave={handleSavePermit} onClose={() => setIsFormOpen(false)} initialData={editingPermit} users={users} jhas={jhas} currentUser={currentUser}/>}
            </Modal>
            
            <Modal isOpen={isDocumentOpen} onClose={() => setIsDocumentOpen(false)} title={`Permiso de Trabajo - ${viewingPermit?.folio || ''}`}>
                {viewingPermit && <WorkPermitDocument permit={viewingPermit} users={users} jhas={jhas} />}
            </Modal>
        </div>
    );
};

export default WorkPermits;
