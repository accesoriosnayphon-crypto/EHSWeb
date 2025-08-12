import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import { Audit, AuditFinding, User, Activity, AuditFindingType, AUDIT_FINDING_TYPES, AuditFindingSeverity, AUDIT_FINDING_SEVERITIES, AuditFindingStatus } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon, ClipboardDocumentListIcon, CheckCircleIcon } from '../constants';
import AuditReport from '../components/AuditReport';


const FindingForm: React.FC<{
    onSave: (finding: Omit<AuditFinding, 'id' | 'auditId'>) => void;
    onClose: () => void;
    initialData: Omit<AuditFinding, 'id' | 'auditId'> | null;
}> = ({ onSave, onClose, initialData }) => {
    const [formState, setFormState] = useState({
        description: initialData?.description || '',
        type: initialData?.type || 'No Conformidad' as AuditFindingType,
        severity: initialData?.severity || 'Menor' as AuditFindingSeverity,
        status: initialData?.status || 'Abierta' as AuditFindingStatus,
        reference: initialData?.reference || '',
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(p => ({...p, [name]: value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción del Hallazgo</label>
                <textarea id="description" name="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Hallazgo</label>
                    <select id="type" name="type" value={formState.type} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required>
                        {AUDIT_FINDING_TYPES.map(t => <option key={t} value={t} className="text-dark-text">{t}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severidad</label>
                    <select id="severity" name="severity" value={formState.severity} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required disabled={formState.type !== 'No Conformidad'}>
                        {AUDIT_FINDING_SEVERITIES.map(s => <option key={s} value={s} className="text-dark-text">{s}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Cláusula / Referencia</label>
                <input id="reference" name="reference" type="text" value={formState.reference} onChange={handleChange} placeholder="Ej: ISO 45001: 8.1.2" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
             <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar Hallazgo</button>
            </div>
        </form>
    )
}

const AuditView: React.FC<{
    audit: Audit;
    onClose: () => void;
    onSaveFinding: (finding: AuditFinding) => void;
    onUpdateFindingStatus: (findingId: string, status: AuditFindingStatus) => void;
    onCreateCorrectiveAction: (finding: AuditFinding) => void;
    users: User[];
}> = ({ audit, onClose, onSaveFinding, onUpdateFindingStatus, onCreateCorrectiveAction, users }) => {
    const [isFindingFormOpen, setIsFindingFormOpen] = useState(false);

    const getFindingTypeClass = (type: AuditFindingType) => {
        switch (type) {
            case 'No Conformidad': return 'bg-red-100 text-red-800';
            case 'Observación': return 'bg-yellow-100 text-yellow-800';
            case 'Oportunidad de Mejora': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100';
        }
    };
    
    const getFindingStatusClass = (status: AuditFindingStatus) => {
        return status === 'Abierta' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800';
    };
    
    return (
        <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-bold text-dark-text">{audit.title}</h3>
                <p className="text-sm text-medium-text">{audit.standard} - Folio: {audit.folio}</p>
                <div className="mt-2 text-sm grid grid-cols-2 gap-x-4">
                    <p><strong>Auditor Líder:</strong> {users.find(u => u.id === audit.leadAuditorId)?.fullName || 'N/A'}</p>
                    <p><strong>Fecha:</strong> {new Date(audit.startDate).toLocaleDateString()} - {new Date(audit.endDate).toLocaleDateString()}</p>
                    <p><strong>Alcance:</strong> {audit.scope}</p>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-dark-text">Hallazgos</h4>
                    <button onClick={() => setIsFindingFormOpen(true)} className="px-4 py-2 bg-secondary text-dark-text rounded-md hover:bg-yellow-500 font-semibold text-sm">+ Agregar Hallazgo</button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {audit.findings.map(finding => (
                               <tr key={finding.id}>
                                   <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFindingTypeClass(finding.type)}`}>{finding.type}</span></td>
                                   <td className="px-4 py-3 text-sm text-gray-600">{finding.description}</td>
                                   <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getFindingStatusClass(finding.status)}`}>{finding.status}</span></td>
                                   <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                        {finding.type === 'No Conformidad' && finding.status === 'Abierta' && (
                                            <button onClick={() => onCreateCorrectiveAction(finding)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Crear Acción Correctiva</button>
                                        )}
                                         {finding.status === 'Abierta' && (
                                            <button onClick={() => onUpdateFindingStatus(finding.id, 'Cerrada')} className="text-green-600 hover:text-green-800" title="Cerrar Hallazgo"><CheckCircleIcon className="w-5 h-5"/></button>
                                        )}
                                   </td>
                               </tr>
                           ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isFindingFormOpen} onClose={() => setIsFindingFormOpen(false)} title="Agregar Hallazgo a la Auditoría">
                <FindingForm 
                    onSave={(newFindingData) => {
                        const newFinding: AuditFinding = {
                            ...newFindingData,
                            id: Date.now().toString(),
                            auditId: audit.id
                        };
                        onSaveFinding(newFinding);
                    }} 
                    onClose={() => setIsFindingFormOpen(false)}
                    initialData={null}
                />
            </Modal>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Volver a la Lista</button>
            </div>
        </div>
    )
}


const Audits: React.FC = () => {
    const [audits, setAudits] = useLocalStorage<Audit[]>('audits', []);
    const [activities, setActivities] = useLocalStorage<Activity[]>('activities', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const { currentUser, hasPermission } = useAuth();
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
    const [isAuditFormOpen, setIsAuditFormOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        const auditId = searchParams.get('auditId');
        if (auditId) {
            const auditToShow = audits.find(a => a.id === auditId);
            if(auditToShow) setSelectedAudit(auditToShow);
            // Clean up URL params
            navigate('/audits', { replace: true });
        }
    }, [searchParams, audits, navigate]);


    const handleSaveAudit = (auditData: Omit<Audit, 'id' | 'folio' | 'findings'>, initialData: Audit | null) => {
        if (initialData) { // Editing
            setAudits(prev => prev.map(a => a.id === initialData.id ? {...initialData, ...auditData} : a));
        } else { // Creating
            const lastFolioNumber = audits.reduce((max, a) => parseInt(a.folio.split('-')[1], 10) || 0, 0);
            const newFolio = `AUD-${String(lastFolioNumber + 1).padStart(4, '0')}`;
            const newAudit: Audit = {
                ...auditData,
                id: new Date().toISOString(),
                folio: newFolio,
                findings: [],
            };
            setAudits(prev => [newAudit, ...prev]);
        }
        setIsAuditFormOpen(false);
    };

    const handleDeleteAudit = (id: string) => {
        if(window.confirm('¿Estás seguro? Se eliminará la auditoría y todos sus hallazgos.')) {
            setAudits(prev => prev.filter(a => a.id !== id));
        }
    };
    
    const handleSaveFinding = (finding: AuditFinding) => {
        setAudits(prev => prev.map(a => {
            if (a.id === finding.auditId) {
                return { ...a, findings: [...a.findings, finding] };
            }
            return a;
        }));
        setSelectedAudit(prev => prev ? {...prev, findings: [...prev.findings, finding]} : null);
    };

    const handleUpdateFindingStatus = (findingId: string, status: AuditFindingStatus) => {
        setAudits(prevAudits => {
            const newAudits = prevAudits.map(audit => ({
                ...audit,
                findings: audit.findings.map(finding => 
                    finding.id === findingId ? { ...finding, status } : finding
                )
            }));
            
            const auditOfFinding = newAudits.find(a => a.findings.some(f => f.id === findingId));
            if(auditOfFinding) setSelectedAudit(auditOfFinding);

            return newAudits;
        });
    };
    
    const handleCreateCorrectiveAction = (finding: AuditFinding) => {
        const newActivity: Activity = {
            id: `act-${Date.now()}`,
            description: `Acción Correctiva para Hallazgo: ${finding.description.substring(0, 100)}... (Ref: ${finding.reference})`,
            registrationDate: new Date().toISOString().split('T')[0],
            commitmentDate: '',
            type: 'Interna',
            priority: finding.severity === 'Mayor' ? 'Alta' : 'Media',
            status: 'Pendiente',
            progress: 0,
            responsibleUserId: '',
            comments: [{
                id: `comment-aud-${Date.now()}`,
                userId: currentUser!.id,
                date: new Date().toISOString(),
                text: `Generado a partir del hallazgo de auditoría ID: ${finding.id} (Ref: ${finding.reference})`
            }],
            estimatedCost: 0,
            sourceAuditId: finding.auditId,
            sourceFindingId: finding.id
        };
        setActivities(prev => [...prev, newActivity]);
        alert(`Se ha creado una nueva tarea en el módulo de Actividades. Por favor, complétela con el responsable y la fecha compromiso.`);
        navigate('/activities');
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            {!selectedAudit ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-dark-text">Programas de Auditoría</h2>
                        {hasPermission('manage_audits') && (
                            <button onClick={() => setIsAuditFormOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                                + Nuevo Programa
                            </button>
                        )}
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Programa de Auditoría</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Norma</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hallazgos</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {audits.map(audit => (
                                    <tr key={audit.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{audit.folio}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{audit.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{audit.standard}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(audit.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{audit.findings.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                            <button onClick={() => setSelectedAudit(audit)} className="text-blue-600 hover:text-blue-900" title="Ver/Gestionar Auditoría">Gestionar</button>
                                             <button onClick={() => { setSelectedAudit(audit); setIsReportModalOpen(true); }} className="text-gray-600 hover:text-primary" title="Ver Reporte"><ClipboardDocumentListIcon className="w-5 h-5"/></button>
                                            {hasPermission('manage_audits') && <button onClick={() => handleDeleteAudit(audit.id)} className="text-red-600 hover:text-red-900" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>}
                                        </td>
                                    </tr>
                                ))}
                             </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <AuditView
                    audit={selectedAudit}
                    onClose={() => setSelectedAudit(null)}
                    onSaveFinding={handleSaveFinding}
                    onUpdateFindingStatus={handleUpdateFindingStatus}
                    onCreateCorrectiveAction={handleCreateCorrectiveAction}
                    users={users}
                />
            )}
            
            <Modal isOpen={isAuditFormOpen} onClose={() => setIsAuditFormOpen(false)} title="Programa de Auditoría">
                <AuditForm 
                    onSave={(data, initial) => handleSaveAudit(data, initial)} 
                    onClose={() => setIsAuditFormOpen(false)} 
                    initialData={null} 
                    users={users} 
                    currentUser={currentUser!} 
                />
            </Modal>
             <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={`Reporte de Auditoría - ${selectedAudit?.folio || ''}`}>
                {selectedAudit && <AuditReport audit={selectedAudit} users={users} />}
            </Modal>
        </div>
    );
};


const AuditForm: React.FC<{
    onSave: (audit: Omit<Audit, 'id' | 'folio' | 'findings'>, initialData: Audit | null) => void;
    onClose: () => void;
    initialData: Audit | null;
    users: User[];
    currentUser: User;
}> = ({ onSave, onClose, initialData, users, currentUser }) => {
    const [formState, setFormState] = useState({
        title: initialData?.title || '',
        standard: initialData?.standard || 'ISO 45001:2018',
        scope: initialData?.scope || '',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData?.endDate || new Date().toISOString().split('T')[0],
        leadAuditorId: initialData?.leadAuditorId || currentUser.id,
        auditorIds: initialData?.auditorIds || [currentUser.id]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
     const handleAuditorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormState(prev => ({ ...prev, auditorIds: selectedOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formState, initialData);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título del Programa</label>
                    <input id="title" name="title" type="text" value={formState.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="standard" className="block text-sm font-medium text-gray-700">Norma / Estándar de Referencia</label>
                    <input id="standard" name="standard" type="text" value={formState.standard} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
             <div>
                <label htmlFor="scope" className="block text-sm font-medium text-gray-700">Alcance (Áreas/Procesos)</label>
                <textarea id="scope" name="scope" value={formState.scope} onChange={handleChange} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                    <input id="startDate" name="startDate" type="date" value={formState.startDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <input id="endDate" name="endDate" type="date" value={formState.endDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="leadAuditorId" className="block text-sm font-medium text-gray-700">Auditor Líder</label>
                    <select id="leadAuditorId" name="leadAuditorId" value={formState.leadAuditorId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text" required>
                       {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="auditorIds" className="block text-sm font-medium text-gray-700">Equipo Auditor</label>
                    <select id="auditorIds" name="auditorIds" multiple value={formState.auditorIds} onChange={handleAuditorChange} className="mt-1 block w-full h-24 px-3 py-2 border border-gray-300 bg-white rounded-md text-dark-text">
                        {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                </div>
            </div>
             <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar Programa</button>
            </div>
        </form>
    );
};

export default Audits;