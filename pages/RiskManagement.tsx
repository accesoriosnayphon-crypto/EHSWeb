
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Jha, JhaStep, JhaHazard, JhaRiskLevel, JHA_RISK_LEVELS } from '../types';
import { useAuth } from '../Auth';
import Modal from '../components/Modal';
import JhaDocument from '../components/JhaDocument';
import { PencilIcon, TrashIcon, DocumentMagnifyingGlassIcon } from '../constants';

// Form to create/edit a JHA
const JhaForm: React.FC<{
    onSave: (jha: Jha) => void;
    onClose: () => void;
    initialData: Jha | null;
}> = ({ onSave, onClose, initialData }) => {
    const [jha, setJha] = useState<Jha>(initialData || {
        id: '',
        title: '',
        area: '',
        creationDate: new Date().toISOString().split('T')[0],
        steps: [{ id: Date.now().toString(), description: '', hazards: [] }],
    });

    const handleJhaChange = (field: keyof Jha, value: string) => {
        setJha(prev => ({ ...prev, [field]: value }));
    };

    const handleStepChange = (stepIndex: number, value: string) => {
        const newSteps = [...jha.steps];
        newSteps[stepIndex].description = value;
        setJha(prev => ({ ...prev, steps: newSteps }));
    };

    const handleHazardChange = (stepIndex: number, hazardIndex: number, field: keyof JhaHazard, value: string) => {
        const newSteps = [...jha.steps];
        (newSteps[stepIndex].hazards[hazardIndex] as any)[field] = value;
        setJha(prev => ({ ...prev, steps: newSteps }));
    };

    const addStep = () => {
        setJha(prev => ({
            ...prev,
            steps: [...prev.steps, { id: Date.now().toString(), description: '', hazards: [] }],
        }));
    };

    const removeStep = (stepIndex: number) => {
        setJha(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== stepIndex),
        }));
    };

    const addHazard = (stepIndex: number) => {
        const newSteps = [...jha.steps];
        newSteps[stepIndex].hazards.push({ id: Date.now().toString(), description: '', controls: '', riskLevel: 'Bajo' });
        setJha(prev => ({ ...prev, steps: newSteps }));
    };

    const removeHazard = (stepIndex: number, hazardIndex: number) => {
        const newSteps = [...jha.steps];
        newSteps[stepIndex].hazards = newSteps[stepIndex].hazards.filter((_, i) => i !== hazardIndex);
        setJha(prev => ({ ...prev, steps: newSteps }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...jha, id: jha.id || new Date().toISOString() });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título del Trabajo / Tarea</label>
                    <input type="text" value={jha.title} onChange={e => handleJhaChange('title', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Área / Departamento</label>
                    <input type="text" value={jha.area} onChange={e => handleJhaChange('area', e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                </div>
            </div>

            <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-bold text-dark-text">Análisis de Riesgos</h3>
                {jha.steps.map((step, stepIndex) => (
                    <div key={step.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-gray-700">Paso {stepIndex + 1}</label>
                            <button type="button" onClick={() => removeStep(stepIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                        <textarea value={step.description} onChange={e => handleStepChange(stepIndex, e.target.value)} placeholder="Descripción del paso..." rows={2} className="block w-full px-3 py-2 border border-gray-300 rounded-md" required />
                        
                        <div className="space-y-2 pl-4 border-l-4 border-blue-200">
                             {step.hazards.map((hazard, hazardIndex) => (
                                 <div key={hazard.id} className="p-3 border rounded-md bg-white space-y-2">
                                     <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-gray-600">Peligro {hazardIndex + 1}</label>
                                        <button type="button" onClick={() => removeHazard(stepIndex, hazardIndex)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                     </div>
                                     <input value={hazard.description} onChange={e => handleHazardChange(stepIndex, hazardIndex, 'description', e.target.value)} placeholder="Descripción del peligro" className="block w-full text-sm px-2 py-1 border border-gray-200 rounded-md" required/>
                                     <textarea value={hazard.controls} onChange={e => handleHazardChange(stepIndex, hazardIndex, 'controls', e.target.value)} placeholder="Medidas de control" rows={2} className="block w-full text-sm px-2 py-1 border border-gray-200 rounded-md" required/>
                                     <select value={hazard.riskLevel} onChange={e => handleHazardChange(stepIndex, hazardIndex, 'riskLevel', e.target.value)} className="block w-full text-sm px-2 py-1 border border-gray-200 rounded-md bg-white text-dark-text">
                                        {JHA_RISK_LEVELS.map(level => <option key={level} value={level} className="text-dark-text">{level}</option>)}
                                     </select>
                                 </div>
                             ))}
                             <button type="button" onClick={() => addHazard(stepIndex)} className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200">+ Agregar Peligro</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addStep} className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 font-semibold">+ Agregar Paso</button>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">Guardar JHA</button>
            </div>
        </form>
    );
};

// Main page
const RiskManagement: React.FC = () => {
    const [jhas, setJhas] = useLocalStorage<Jha[]>('jhas', []);
    const { hasPermission } = useAuth();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDocumentOpen, setIsDocumentOpen] = useState(false);
    const [currentJha, setCurrentJha] = useState<Jha | null>(null);

    const handleSave = (jha: Jha) => {
        setJhas(prev => {
            const exists = prev.some(j => j.id === jha.id);
            if (exists) {
                return prev.map(j => j.id === jha.id ? jha : j);
            }
            return [...prev, jha];
        });
        setIsFormOpen(false);
        setCurrentJha(null);
    };

    const handleOpenForm = (jha: Jha | null) => {
        setCurrentJha(jha);
        setIsFormOpen(true);
    };

    const handleOpenDocument = (jha: Jha) => {
        setCurrentJha(jha);
        setIsDocumentOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este Análisis de Trabajo Seguro?')) {
            setJhas(prev => prev.filter(j => j.id !== id));
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-dark-text">Análisis de Trabajo Seguro (JHA)</h2>
                {hasPermission('manage_jha') && (
                    <button onClick={() => handleOpenForm(null)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                        + Crear Nuevo JHA
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título de la Tarea</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {jhas.map(jha => (
                            <tr key={jha.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{jha.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jha.area}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(jha.creationDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenDocument(jha)} className="text-gray-600 hover:text-primary" title="Ver Documento">
                                        <DocumentMagnifyingGlassIcon className="w-5 h-5" />
                                    </button>
                                    {hasPermission('manage_jha') && (
                                        <>
                                            <button onClick={() => handleOpenForm(jha)} className="text-indigo-600 hover:text-indigo-900" title="Editar">
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(jha.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {jhas.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500">No hay JHA registrados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={currentJha ? 'Editar JHA' : 'Crear Nuevo JHA'}>
                <JhaForm onSave={handleSave} onClose={() => setIsFormOpen(false)} initialData={currentJha} />
            </Modal>

            <Modal isOpen={isDocumentOpen} onClose={() => setIsDocumentOpen(false)} title={`JHA: ${currentJha?.title || ''}`}>
                {currentJha && <JhaDocument jha={currentJha} />}
            </Modal>
        </div>
    );
};

export default RiskManagement;
