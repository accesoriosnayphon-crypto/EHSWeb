
import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { SafetyEquipment, SafetyInspectionLog, User, EQUIPMENT_TYPES, EquipmentType, SafetyInspectionLogStatus } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon } from '../constants';

// Helper function to calculate next inspection date and status
const getInspectionStatus = (equipment: SafetyEquipment): { nextDate: Date | null, status: 'En Regla' | 'Próximo a Vencer' | 'Vencido' | 'Nunca' } => {
    if (!equipment.lastInspectionDate) {
        return { nextDate: null, status: 'Nunca' };
    }
    const lastDate = new Date(equipment.lastInspectionDate + 'T00:00:00');
    const nextDate = new Date(lastDate.setDate(lastDate.getDate() + equipment.inspectionFrequency));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return { nextDate, status: 'Vencido' };
    if (diffDays <= 7) return { nextDate, status: 'Próximo a Vencer' };
    return { nextDate, status: 'En Regla' };
};


// Form to add/edit safety equipment
const EquipmentForm: React.FC<{
    onSave: (equipment: Omit<SafetyEquipment, 'id'> | SafetyEquipment) => void;
    onClose: () => void;
    initialData: SafetyEquipment | null;
}> = ({ onSave, onClose, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<EquipmentType>(initialData?.type || 'Extintor');
    const [location, setLocation] = useState(initialData?.location || '');
    const [inspectionFrequency, setInspectionFrequency] = useState(initialData?.inspectionFrequency || 30);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(initialData || {}),
            id: initialData?.id || '',
            name,
            type,
            location,
            inspectionFrequency,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Equipo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Extintor Pasillo Norte" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Equipo</label>
                    <select value={type} onChange={e => setType(e.target.value as EquipmentType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        {EQUIPMENT_TYPES.map(t => <option key={t} value={t} className="text-dark-text">{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej: Planta 1, Almacén" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Frecuencia de Inspección (días)</label>
                <input type="number" value={inspectionFrequency} onChange={e => setInspectionFrequency(Number(e.target.value))} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar Equipo</button>
            </div>
        </form>
    );
};

// Form to log an inspection
const LogInspectionForm: React.FC<{
    onSave: (log: Omit<SafetyInspectionLog, 'id' | 'inspectorId'>) => void;
    onClose: () => void;
    equipment: SafetyEquipment;
}> = ({ onSave, onClose, equipment }) => {
    const [status, setStatus] = useState<SafetyInspectionLogStatus>('OK');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            equipmentId: equipment.id,
            inspectionDate: new Date().toISOString().split('T')[0],
            status,
            notes,
        });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <h3 className="font-bold text-lg">{equipment.name}</h3>
                <p className="text-sm text-gray-500">{equipment.location} - {equipment.type}</p>
            </div>
             <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700">Estado de la Inspección</label>
                 <select value={status} onChange={e => setStatus(e.target.value as SafetyInspectionLogStatus)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                    <option value="OK" className="text-dark-text">OK</option>
                    <option value="Reparación Requerida" className="text-dark-text">Reparación Requerida</option>
                    <option value="Reemplazo Requerido" className="text-dark-text">Reemplazo Requerido</option>
                 </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
             </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Registrar Inspección</button>
            </div>
        </form>
    );
};

// Main page
const SafetyInspections: React.FC = () => {
    const [equipment, setEquipment] = useLocalStorage<SafetyEquipment[]>('safety_equipment', []);
    const [logs, setLogs] = useLocalStorage<SafetyInspectionLog[]>('safety_inspection_logs', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const { currentUser, hasPermission } = useAuth();
    
    const [view, setView] = useState<'agenda' | 'history'>('agenda');
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<SafetyEquipment | null>(null);
    const [inspectingEquipment, setInspectingEquipment] = useState<SafetyEquipment | null>(null);
    
    const equipmentWithStatus = useMemo(() => {
        return equipment.map(e => ({
            ...e,
            ...getInspectionStatus(e),
        })).sort((a,b) => (a.nextDate?.getTime() || Infinity) - (b.nextDate?.getTime() || Infinity));
    }, [equipment]);

    const handleSaveEquipment = (data: Omit<SafetyEquipment, 'id'> | SafetyEquipment) => {
        if ('id' in data && data.id) { // Editing
            setEquipment(prev => prev.map(e => e.id === data.id ? data as SafetyEquipment : e));
        } else { // Creating
            const newEquipment: SafetyEquipment = { ...data, id: new Date().toISOString() };
            setEquipment(prev => [...prev, newEquipment]);
        }
        setIsEquipmentModalOpen(false);
        setEditingEquipment(null);
    };

    const handleDeleteEquipment = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este equipo? Se borrará también su historial de inspecciones.')) {
            setEquipment(prev => prev.filter(e => e.id !== id));
            setLogs(prev => prev.filter(l => l.equipmentId !== id));
        }
    };
    
    const handleLogInspection = (logData: Omit<SafetyInspectionLog, 'id' | 'inspectorId'>) => {
        const newLog: SafetyInspectionLog = {
            ...logData,
            id: new Date().toISOString(),
            inspectorId: currentUser!.id,
        };
        setLogs(prev => [newLog, ...prev]);
        setEquipment(prev => prev.map(e => e.id === logData.equipmentId ? {...e, lastInspectionDate: logData.inspectionDate} : e));
        setIsLogModalOpen(false);
        setInspectingEquipment(null);
    };
    
    const getInspectorName = (id: string) => users.find(u => u.id === id)?.fullName || 'N/A';
    const getEquipmentName = (id: string) => equipment.find(e => e.id === id)?.name || 'N/A';
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={() => setView('agenda')} className={`px-4 py-2 text-sm font-semibold rounded-l-md ${view === 'agenda' ? 'bg-primary text-white' : 'bg-white text-dark-text'}`}>
                        Agenda de Inspecciones
                    </button>
                    <button onClick={() => setView('history')} className={`px-4 py-2 text-sm font-semibold rounded-r-md border-l ${view === 'history' ? 'bg-primary text-white' : 'bg-white text-dark-text'}`}>
                        Historial de Registros
                    </button>
                </div>
                {hasPermission('manage_safety_inspections') && view === 'agenda' &&(
                    <button onClick={() => {setEditingEquipment(null); setIsEquipmentModalOpen(true);}} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        + Agregar Equipo
                    </button>
                )}
            </div>

            {view === 'agenda' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Próxima Inspección</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                {hasPermission('manage_safety_inspections') && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {equipmentWithStatus.map(e => (
                                <tr key={e.id}>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{e.name}</div><div className="text-xs text-gray-500">{e.type}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.nextDate ? e.nextDate.toLocaleDateString() : 'Pendiente'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            e.status === 'En Regla' ? 'bg-green-100 text-green-800' : 
                                            e.status === 'Próximo a Vencer' ? 'bg-yellow-100 text-yellow-800' :
                                            e.status === 'Vencido' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    {hasPermission('manage_safety_inspections') && <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => {setInspectingEquipment(e); setIsLogModalOpen(true);}} className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Inspeccionar</button>
                                        <button onClick={() => {setEditingEquipment(e); setIsEquipmentModalOpen(true);}} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteEquipment(e.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-4 h-4" /></button>
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {view === 'history' && (
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {logs.map(log => (
                                 <tr key={log.id}>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.inspectionDate + 'T00:00:00').toLocaleDateString()}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getEquipmentName(log.equipmentId)}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{log.status}</span></td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getInspectorName(log.inspectorId)}</td>
                                     <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate" title={log.notes}>{log.notes || 'N/A'}</td>
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                </div>
            )}
            
            {hasPermission('manage_safety_inspections') && (
                <>
                    <Modal isOpen={isEquipmentModalOpen} onClose={() => setIsEquipmentModalOpen(false)} title={editingEquipment ? "Editar Equipo de Seguridad" : "Agregar Equipo de Seguridad"}>
                        <EquipmentForm onSave={handleSaveEquipment} onClose={() => setIsEquipmentModalOpen(false)} initialData={editingEquipment} />
                    </Modal>
                    <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Registrar Inspección de Seguridad">
                        {inspectingEquipment && <LogInspectionForm onSave={handleLogInspection} onClose={() => setIsLogModalOpen(false)} equipment={inspectingEquipment} />}
                    </Modal>
                </>
            )}
        </div>
    );
};

export default SafetyInspections;
