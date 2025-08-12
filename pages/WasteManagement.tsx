import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Waste, WasteLog, WasteType, WASTE_TYPES, WasteUnit, WASTE_UNITS, User } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, ClipboardDocumentListIcon } from '../constants';
import WasteDisposalDocument from '../components/WasteDisposalDocument';

// Form for adding/editing a waste type
const WasteForm: React.FC<{
    onSave: (waste: Omit<Waste, 'id'> | Waste) => void;
    onClose: () => void;
    initialData: Waste | null;
}> = ({ onSave, onClose, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [type, setType] = useState<WasteType>(initialData?.type || 'No Peligroso');
    const [storageLocation, setStorageLocation] = useState(initialData?.storageLocation || '');
    const [disposalMethod, setDisposalMethod] = useState(initialData?.disposalMethod || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(initialData || {}),
            id: initialData?.id || '',
            name,
            type,
            storageLocation,
            disposalMethod,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Residuo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Aceite Usado, Chatarra" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Residuo</label>
                <select value={type} onChange={e => setType(e.target.value as WasteType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                    {WASTE_TYPES.map(t => <option key={t} value={t} className="text-dark-text">{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Ubicación de Almacenamiento Temporal</label>
                <input type="text" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} placeholder="Ej: Contenedor Rojo, Almacén Central" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Método de Disposición Final</label>
                <input type="text" value={disposalMethod} onChange={e => setDisposalMethod(e.target.value)} placeholder="Ej: Relleno sanitario, Incineración" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar</button>
            </div>
        </form>
    );
};

// Form for logging a waste disposal
const WasteLogForm: React.FC<{
    onSave: (log: Omit<WasteLog, 'id' | 'recordedByUserId' | 'folio'>) => void;
    onClose: () => void;
    wastes: Waste[];
}> = ({ onSave, onClose, wastes }) => {
    const [wasteId, setWasteId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [quantity, setQuantity] = useState<number>(0);
    const [unit, setUnit] = useState<WasteUnit>('Kg');
    const [manifestNumber, setManifestNumber] = useState('');
    const [manifestUrl, setManifestUrl] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [disposalCompany, setDisposalCompany] = useState('');
    const [cost, setCost] = useState<number | undefined>(undefined);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setManifestUrl(reader.result as string);
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!wasteId || quantity <= 0) {
            alert("Seleccione un residuo y una cantidad válida.");
            return;
        }
        onSave({ wasteId, date, quantity, unit, manifestNumber, manifestUrl, disposalCompany, cost });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Residuo</label>
                <select value={wasteId} onChange={e => setWasteId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required>
                    <option value="">Seleccione un residuo</option>
                    {wastes.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="0.01" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Unidad</label>
                    <select value={unit} onChange={e => setUnit(e.target.value as WasteUnit)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        {WASTE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Disposición</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nº de Manifiesto (si aplica)</label>
                    <input type="text" value={manifestNumber} onChange={e => setManifestNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Empresa Transportista</label>
                    <input type="text" value={disposalCompany} onChange={e => setDisposalCompany(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Costo (USD, si aplica)</label>
                <input type="number" value={cost === undefined ? '' : cost} onChange={e => setCost(e.target.value === '' ? undefined : Number(e.target.value))} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Adjuntar Manifiesto (PDF o Imagen)</label>
                <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
                {fileName && <p className="text-xs text-gray-500 mt-1">Archivo seleccionado: {fileName}</p>}
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Registrar Disposición</button>
            </div>
        </form>
    );
};

const WasteManagement: React.FC = () => {
    const [wastes, setWastes] = useLocalStorage<Waste[]>('wastes', []);
    const [wasteLogs, setWasteLogs] = useLocalStorage<WasteLog[]>('waste_logs', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const { currentUser, hasPermission } = useAuth();

    const [view, setView] = useState<'log' | 'catalog'>('log');
    const [isWasteFormOpen, setIsWasteFormOpen] = useState(false);
    const [isLogFormOpen, setIsLogFormOpen] = useState(false);
    const [editingWaste, setEditingWaste] = useState<Waste | null>(null);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [viewingLog, setViewingLog] = useState<WasteLog | null>(null);

    const handleSaveWaste = (data: Omit<Waste, 'id'> | Waste) => {
        if ('id' in data && data.id) { // Editing
            setWastes(prev => prev.map(w => w.id === data.id ? data as Waste : w));
        } else { // Creating
            const newWaste: Waste = { ...data as Omit<Waste, 'id'>, id: new Date().toISOString() };
            setWastes(prev => [...prev, newWaste]);
        }
        setIsWasteFormOpen(false);
        setEditingWaste(null);
    };
    
    const handleDeleteWaste = (id: string) => {
        if (wasteLogs.some(log => log.wasteId === id)) {
            alert('No se puede eliminar un tipo de residuo que ya tiene registros de disposición. Primero elimine los registros asociados.');
            return;
        }
        if (window.confirm('¿Estás seguro de eliminar este tipo de residuo?')) {
            setWastes(prev => prev.filter(w => w.id !== id));
        }
    };
    
    const handleSaveLog = (logData: Omit<WasteLog, 'id' | 'recordedByUserId' | 'folio'>) => {
        const lastFolioNumber = wasteLogs.reduce((max, log) => {
            const num = parseInt(log.folio?.split('-')[1] || '0', 10);
            return num > max ? num : max;
        }, 0);
        const newFolio = `RD-${String(lastFolioNumber + 1).padStart(5, '0')}`;

        const newLog: WasteLog = {
            ...logData,
            id: new Date().toISOString(),
            folio: newFolio,
            recordedByUserId: currentUser!.id,
        };
        setWasteLogs(prev => [newLog, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLogFormOpen(false);
    };
    
    const handleViewDocument = (log: WasteLog) => {
        setViewingLog(log);
        setIsDocumentModalOpen(true);
    };
    
    const getWasteInfo = (id: string): Waste => {
        const waste = wastes.find(w => w.id === id);
        if (waste) {
            return waste;
        }
        return {
            id: `deleted-${id}`,
            name: 'Residuo Eliminado',
            type: 'No Peligroso',
            storageLocation: 'N/A',
            disposalMethod: 'N/A',
        };
    };

    const getWasteTypeClass = (type: WasteType) => {
        switch(type) {
            case 'Peligroso': return 'bg-red-100 text-red-800';
            case 'Reciclable': return 'bg-green-100 text-green-800';
            case 'No Peligroso': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                 <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={() => setView('log')} className={`px-4 py-2 text-sm font-semibold rounded-l-md ${view === 'log' ? 'bg-primary text-white' : 'bg-white text-dark-text'}`}>
                        Registro de Disposición
                    </button>
                    <button onClick={() => setView('catalog')} className={`px-4 py-2 text-sm font-semibold rounded-r-md border-l ${view === 'catalog' ? 'bg-primary text-white' : 'bg-white text-dark-text'}`}>
                        Catálogo de Residuos
                    </button>
                </div>
                 {hasPermission('manage_waste') && (
                    <button 
                        onClick={() => view === 'log' ? setIsLogFormOpen(true) : setIsWasteFormOpen(true)} 
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        {view === 'log' ? '+ Nuevo Registro' : '+ Nuevo Tipo de Residuo'}
                    </button>
                )}
            </div>

            {view === 'log' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Residuo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manifiesto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {wasteLogs.map(log => {
                                const wasteInfo = getWasteInfo(log.wasteId);
                                return (
                                <tr key={log.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.folio}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.date + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {wasteInfo.name}
                                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWasteTypeClass(wasteInfo.type)}`}>{wasteInfo.type}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{log.quantity} {log.unit}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{log.manifestNumber || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleViewDocument(log)} className="text-gray-600 hover:text-primary" title="Ver Documento de Disposición">
                                            <ClipboardDocumentListIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {wasteLogs.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-500">No hay registros de disposición.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            
            {view === 'catalog' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre del Residuo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Almacenamiento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disposición</th>
                                {hasPermission('manage_waste') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {wastes.map(waste => (
                               <tr key={waste.id}>
                                   <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{waste.name}</td>
                                   <td className="px-4 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getWasteTypeClass(waste.type)}`}>{waste.type}</span></td>
                                   <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{waste.storageLocation}</td>
                                   <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{waste.disposalMethod}</td>
                                   {hasPermission('manage_waste') && <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                       <button onClick={() => {setEditingWaste(waste); setIsWasteFormOpen(true)}} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-5 h-5"/></button>
                                       <button onClick={() => handleDeleteWaste(waste.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5"/></button>
                                   </td>}
                               </tr>
                           ))}
                           {wastes.length === 0 && <tr><td colSpan={hasPermission('manage_waste') ? 5 : 4} className="text-center py-4 text-gray-500">No hay residuos en el catálogo.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
            
            {hasPermission('manage_waste') && (
                <>
                <Modal isOpen={isWasteFormOpen} onClose={() => setIsWasteFormOpen(false)} title={editingWaste ? 'Editar Tipo de Residuo' : 'Nuevo Tipo de Residuo'}>
                    <WasteForm onSave={handleSaveWaste} onClose={() => {setIsWasteFormOpen(false); setEditingWaste(null)}} initialData={editingWaste} />
                </Modal>
                <Modal isOpen={isLogFormOpen} onClose={() => setIsLogFormOpen(false)} title="Registrar Disposición de Residuos">
                    <WasteLogForm onSave={handleSaveLog} onClose={() => setIsLogFormOpen(false)} wastes={wastes} />
                </Modal>
                </>
            )}

            <Modal isOpen={isDocumentModalOpen} onClose={() => setIsDocumentModalOpen(false)} title={`Manifiesto de Disposición - Folio ${viewingLog?.folio || ''}`}>
                {viewingLog && (
                    <WasteDisposalDocument
                        log={viewingLog}
                        waste={getWasteInfo(viewingLog.wasteId)}
                        recordedByUser={users.find(u => u.id === viewingLog.recordedByUserId) || null}
                    />
                )}
            </Modal>
        </div>
    );
};

export default WasteManagement;