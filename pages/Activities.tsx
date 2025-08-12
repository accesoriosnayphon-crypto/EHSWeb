import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Activity, ActivityPriority, ActivityStatus, ActivityType, User, Comment } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, DocumentCheckIcon, ChatBubbleBottomCenterTextIcon } from '../constants';
import { useNavigate } from 'react-router-dom';


// Form to add/edit an activity
const ActivityForm: React.FC<{
    onSave: (activity: Omit<Activity, 'id'>) => void;
    onClose: () => void;
    initialData: Activity | null;
    users: User[];
}> = ({ onSave, onClose, initialData, users }) => {
    const [formState, setFormState] = useState({
        registrationDate: initialData?.registrationDate || new Date().toISOString().split('T')[0],
        commitmentDate: initialData?.commitmentDate || '',
        description: initialData?.description || '',
        type: initialData?.type || 'Interna' as ActivityType,
        provider: initialData?.provider || '',
        estimatedCost: initialData?.estimatedCost || 0,
        priority: initialData?.priority || 'Media' as ActivityPriority,
        responsibleUserId: initialData?.responsibleUserId || '',
        sourceAuditId: initialData?.sourceAuditId,
        sourceFindingId: initialData?.sourceFindingId,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.description || !formState.commitmentDate || !formState.responsibleUserId) {
            alert('Por favor, complete los campos de descripción, fecha compromiso y responsable.');
            return;
        }
        onSave({
            ...formState,
            estimatedCost: Number(formState.estimatedCost),
            status: initialData?.status || 'Pendiente',
            progress: initialData?.progress || 0,
            comments: initialData?.comments || [],
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción de la Actividad</label>
                <textarea id="description" name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                    <input type="date" id="registrationDate" name="registrationDate" value={formState.registrationDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="commitmentDate" className="block text-sm font-medium text-gray-700">Fecha Compromiso</label>
                    <input type="date" id="commitmentDate" name="commitmentDate" value={formState.commitmentDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select id="type" name="type" value={formState.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        <option value="Interna" className="text-dark-text">Interna</option>
                        <option value="Externa" className="text-dark-text">Externa</option>
                    </select>
                </div>
                 {formState.type === 'Externa' && (
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Proveedor / Persona Externa</label>
                        <input type="text" id="provider" name="provider" value={formState.provider} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                )}
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridad</label>
                    <select id="priority" name="priority" value={formState.priority} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        <option value="Baja" className="text-dark-text">Baja</option>
                        <option value="Media" className="text-dark-text">Media</option>
                        <option value="Alta" className="text-dark-text">Alta</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700">Costo Estimado (USD)</label>
                    <input type="number" id="estimatedCost" name="estimatedCost" value={formState.estimatedCost} onChange={handleChange} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                 <label htmlFor="responsibleUserId" className="block text-sm font-medium text-gray-700">Responsable</label>
                 <select id="responsibleUserId" name="responsibleUserId" value={formState.responsibleUserId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required>
                    <option value="" className="text-gray-500">Seleccione un responsable</option>
                    {users.map(user => <option key={user.id} value={user.id} className="text-dark-text">{user.fullName}</option>)}
                 </select>
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar Actividad</button>
            </div>
        </form>
    );
}

// Modal for updating progress and adding comments
const ActivityDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    activity: Activity | null;
    onUpdate: (activityId: string, updates: { progress?: number; newCommentText?: string }) => void;
    users: User[];
    currentUser: User;
}> = ({ isOpen, onClose, activity, onUpdate, users, currentUser }) => {
    const [progress, setProgress] = useState(activity?.progress || 0);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        if (activity) {
            setProgress(activity.progress);
        }
    }, [activity]);

    if (!activity) return null;

    const handleProgressChange = (newProgress: number) => {
        setProgress(newProgress);
        onUpdate(activity.id, { progress: newProgress });
    };

    const handleAddComment = () => {
        if (commentText.trim()) {
            onUpdate(activity.id, { newCommentText: commentText });
            setCommentText('');
        }
    };
    
    const getUserName = (id: string) => users.find(u => u.id === id)?.fullName || 'Usuario Desconocido';
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seguimiento de Actividad">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-dark-text">{activity.description}</h3>
                    <p className="text-sm text-medium-text">Responsable: {getUserName(activity.responsibleUserId)}</p>
                    <p className="text-sm text-medium-text">Fecha Compromiso: {new Date(activity.commitmentDate + 'T00:00:00').toLocaleDateString()}</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="progress-slider" className="block text-sm font-medium text-gray-700">Progreso: {progress}%</label>
                    <input
                        id="progress-slider"
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(Number(e.target.value))}
                        onMouseUp={(e) => handleProgressChange(Number(e.currentTarget.value))}
                        onTouchEnd={(e) => handleProgressChange(Number(e.currentTarget.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        disabled={activity.status === 'Completada'}
                    />
                </div>

                <div className="space-y-4">
                    <h4 className="text-md font-semibold text-dark-text border-b pb-2">Comentarios</h4>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {activity.comments.map(comment => (
                            <div key={comment.id} className="p-3 bg-gray-100 rounded-lg">
                                <div className="flex justify-between items-center text-xs text-medium-text mb-1">
                                    <span className="font-bold">{getUserName(comment.userId)}</span>
                                    <span>{new Date(comment.date).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-dark-text">{comment.text}</p>
                            </div>
                        ))}
                         {activity.comments.length === 0 && <p className="text-sm text-gray-500">No hay comentarios aún.</p>}
                    </div>
                     {activity.status !== 'Completada' && (
                        <div className="flex items-start space-x-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Añadir un comentario..."
                                rows={2}
                                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                            <button onClick={handleAddComment} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Enviar</button>
                        </div>
                     )}
                </div>
            </div>
        </Modal>
    )
}


// Main component for Activities page
const Activities: React.FC = () => {
    const [storedActivities, setActivities] = useLocalStorage<Activity[]>('activities', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const { currentUser, hasPermission } = useAuth();
    const navigate = useNavigate();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [filters, setFilters] = useState({ startDate: '', endDate: '' });

    // One-time data migration for backward compatibility
    useEffect(() => {
        const needsMigration = storedActivities.some(a => typeof a.comments === 'string' || a.progress === undefined);
        if (needsMigration) {
            const migrated = storedActivities.map(activity => {
                const commentsArray = Array.isArray((activity as any).comments) 
                    ? (activity as any).comments 
                    : (typeof (activity as any).comments === 'string' && (activity as any).comments)
                        ? [{ id: `migrated-${activity.id}`, userId: 'system', date: activity.registrationDate, text: (activity as any).comments }]
                        : [];
                
                const progressValue = typeof (activity as any).progress === 'number'
                    ? (activity as any).progress
                    : activity.status === 'Completada' ? 100 : 0;
                
                return {
                    ...activity,
                    comments: commentsArray,
                    progress: progressValue
                };
            });
            setActivities(migrated as Activity[]);
        }
    }, []);

    const filteredActivities = useMemo(() => {
        return storedActivities.filter(activity => {
            if (!filters.startDate && !filters.endDate) return true;
            const commitmentDate = new Date(activity.commitmentDate + 'T00:00:00');
            const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
            const endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;

            if (startDate && commitmentDate < startDate) return false;
            if (endDate && commitmentDate > endDate) return false;
            return true;
        }).sort((a,b) => new Date(a.commitmentDate).getTime() - new Date(b.commitmentDate).getTime());
    }, [storedActivities, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveActivity = (data: Omit<Activity, 'id'>) => {
        if (editingActivity) { // Editing
            setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...editingActivity, ...data } : a));
        } else { // Creating
            const newActivity: Activity = {
                ...data,
                id: new Date().toISOString(),
                status: 'Pendiente',
                progress: 0,
                comments: []
            };
            setActivities(prev => [...prev, newActivity]);
        }
        setIsFormModalOpen(false);
        setEditingActivity(null);
    };

    const handleUpdateActivity = (activityId: string, updates: { progress?: number, newCommentText?: string }) => {
        setActivities(prevActivities =>
            prevActivities.map(activity => {
                if (activity.id === activityId) {
                    const updatedActivity = { ...activity };
                    if (updates.progress !== undefined) {
                        const newProgress = Math.max(0, Math.min(100, updates.progress));
                        updatedActivity.progress = newProgress;
                        if (newProgress === 100) updatedActivity.status = 'Completada';
                        else if (newProgress > 0) updatedActivity.status = 'En Progreso';
                        else updatedActivity.status = 'Pendiente';
                    }
                    if (updates.newCommentText?.trim() && currentUser) {
                        const newComment: Comment = {
                            id: `comment-${Date.now()}`,
                            userId: currentUser.id,
                            date: new Date().toISOString(),
                            text: updates.newCommentText.trim(),
                        };
                        updatedActivity.comments = [...updatedActivity.comments, newComment];
                    }
                    if(selectedActivity?.id === activityId) {
                        setSelectedActivity(updatedActivity);
                    }
                    return updatedActivity;
                }
                return activity;
            })
        );
    };

    const handleDeleteActivity = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
            setActivities(prev => prev.filter(a => a.id !== id));
        }
    };
    
    const openDetailsModal = (activity: Activity) => {
        setSelectedActivity(activity);
        setIsDetailsModalOpen(true);
    };
    
    const getResponsibleName = (id: string) => users.find(u => u.id === id)?.fullName || 'N/A';
    
    const getPriorityClass = (priority: ActivityPriority) => {
        switch(priority) {
            case 'Alta': return 'bg-red-100 text-red-800';
            case 'Media': return 'bg-yellow-100 text-yellow-800';
            case 'Baja': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusClass = (status: ActivityStatus) => {
        switch(status) {
            case 'Completada': return 'bg-green-100 text-green-800';
            case 'En Progreso': return 'bg-purple-100 text-purple-800';
            case 'Pendiente': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const navigateToAudit = (auditId?: string) => {
        if (auditId) {
            navigate(`/audits?view=findings&auditId=${auditId}`);
        }
    };
    
    const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
        const bgColor = progress === 100 ? 'bg-green-500' : 'bg-blue-500';
        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${bgColor} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-bold text-dark-text">Gestión de Actividades</h2>
                <div className="flex items-center space-x-4">
                     <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md" title="Fecha Desde (Compromiso)"/>
                     <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-md" title="Fecha Hasta (Compromiso)"/>
                     {hasPermission('manage_activities') && (
                        <button onClick={() => { setEditingActivity(null); setIsFormModalOpen(true); }} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex-shrink-0">
                            + Nueva Actividad
                        </button>
                    )}
                </div>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Compromiso</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Responsable</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                             {hasPermission('manage_activities') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredActivities.map(activity => (
                             <tr key={activity.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(activity.commitmentDate + 'T00:00:00').toLocaleDateString()}</td>
                                <td className="px-4 py-4 text-sm text-gray-900 max-w-sm" title={activity.description}>
                                    <div className="flex items-center">
                                         {activity.sourceFindingId && (
                                            <button onClick={() => navigateToAudit(activity.sourceAuditId)} className="flex-shrink-0 mr-2 text-blue-500 hover:text-blue-700" title="Ver hallazgo de auditoría de origen">
                                                <DocumentCheckIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{activity.description}</p>
                                            <p className="text-xs text-gray-500">{activity.type}{activity.type === 'Externa' ? ` (${activity.provider})` : ''}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(activity.priority)}`}>{activity.priority}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{getResponsibleName(activity.responsibleUserId)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm w-48">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full">
                                          <ProgressBar progress={activity.progress}/>
                                        </div>
                                        <span className={`text-xs font-semibold ${getStatusClass(activity.status)} px-2 py-0.5 rounded-full`}>{activity.status}</span>
                                    </div>
                                </td>
                                {hasPermission('manage_activities') && <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => openDetailsModal(activity)} className="text-gray-600 hover:text-primary" title="Ver detalles y comentarios"><ChatBubbleBottomCenterTextIcon className="w-5 h-5" /></button>
                                    <button onClick={() => { setEditingActivity(activity); setIsFormModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="Modificar"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteActivity(activity.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                </td>}
                            </tr>
                        ))}
                         {filteredActivities.length === 0 && (
                             <tr><td colSpan={hasPermission('manage_activities') ? 6 : 5} className="text-center py-4 text-gray-500">No hay actividades para mostrar.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {hasPermission('manage_activities') && (
                 <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingActivity ? 'Modificar Actividad' : 'Registrar Nueva Actividad'}>
                     <ActivityForm onSave={handleSaveActivity} onClose={() => { setIsFormModalOpen(false); setEditingActivity(null); }} initialData={editingActivity} users={users} />
                </Modal>
            )}

            {currentUser && <ActivityDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                activity={selectedActivity}
                onUpdate={handleUpdateActivity}
                users={users}
                currentUser={currentUser}
            />}
        </div>
    );
};

export default Activities;