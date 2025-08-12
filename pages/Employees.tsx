
import React, { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Employee } from '../types';
import Modal from '../components/Modal';
import { PencilIcon, TrashIcon } from '../constants';
import { useAuth } from '../Auth';

const EmployeeForm: React.FC<{
    onSave: (employee: Omit<Employee, 'id'>) => void;
    onClose: () => void;
    initialData: Employee | null;
}> = ({ onSave, onClose, initialData }) => {
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [employeeNumber, setEmployeeNumber] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDepartment(initialData.department);
            setPosition(initialData.position);
            setEmployeeNumber(initialData.employeeNumber);
        } else {
            setName('');
            setDepartment('');
            setPosition('');
            setEmployeeNumber('');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !department || !position || !employeeNumber) return;
        onSave({ name, department, position, employeeNumber });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700">Número de Empleado</label>
                <input type="text" id="employeeNumber" value={employeeNumber} onChange={e => setEmployeeNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
                <input type="text" id="department" value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Puesto</label>
                <input type="text" id="position" value={position} onChange={e => setPosition(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button>
            </div>
        </form>
    );
};

const Employees: React.FC = () => {
    const [employees, setEmployees] = useLocalStorage<Employee[]>('employees', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { hasPermission } = useAuth();

    const handleSaveEmployee = (employeeData: Omit<Employee, 'id'>) => {
        if (editingEmployee) {
            setEmployees(prev => prev.map(emp =>
                emp.id === editingEmployee.id ? { id: editingEmployee.id, ...employeeData } : emp
            ));
        } else {
            const newEmployee: Employee = {
                id: new Date().toISOString(),
                ...employeeData
            };
            setEmployees(prev => [...prev, newEmployee]);
        }
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleAddNew = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleDelete = (employeeId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar a este empleado?')) {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        }
    };

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-bold text-dark-text">Lista de Empleados</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o número..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    {hasPermission('manage_employees') && (
                        <button onClick={handleAddNew} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex-shrink-0">
                            + Agregar Empleado
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Empleado</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puesto</th>
                            {hasPermission('manage_employees') && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredEmployees.map(employee => (
                            <tr key={employee.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{employee.employeeNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                                {hasPermission('manage_employees') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleEdit(employee)} className="text-indigo-600 hover:text-indigo-900" title="Modificar">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan={hasPermission('manage_employees') ? 5 : 4} className="text-center py-4 text-gray-500">
                                    {employees.length > 0 ? 'No se encontraron empleados con ese criterio.' : 'No hay empleados registrados.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {hasPermission('manage_employees') && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEmployee ? 'Modificar Empleado' : 'Agregar Nuevo Empleado'}>
                    <EmployeeForm onSave={handleSaveEmployee} onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }} initialData={editingEmployee} />
                </Modal>
            )}
        </div>
    );
};

export default Employees;
