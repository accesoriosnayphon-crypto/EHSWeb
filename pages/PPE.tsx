
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { PpeItem, PpeDelivery, Employee, DeliveryType, User } from '../types';
import Modal from '../components/Modal';
import DeliveryReceipt from '../components/DeliveryReceipt';
import { PrinterIcon, CheckCircleIcon } from '../constants';
import { useAuth } from '../Auth';

const PpeItemForm: React.FC<{ onSave: (item: Omit<PpeItem, 'id'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [size, setSize] = useState('');
    const [stock, setStock] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, stock, type, size });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del EPP</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Guantes de seguridad" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Tipo / Material</label>
                <input type="text" value={type} onChange={e => setType(e.target.value)} placeholder="Ej: Nitrilo, N95, Carnaza" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Talla</label>
                <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="Ej: S, M, L, Unitalla" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Stock Inicial</label>
                <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} min="0" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Guardar</button>
            </div>
        </form>
    );
};

const PpeDeliveryForm: React.FC<{ onSave: (delivery: Omit<PpeDelivery, 'id' | 'folio' | 'status' | 'requestedByUserId' | 'approvedByUserId'>) => void, onClose: () => void, employees: Employee[], ppeItems: PpeItem[] }> = ({ onSave, onClose, employees, ppeItems }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [ppeId, setPpeId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('Renovación');
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
    const [renewalDate, setRenewalDate] = useState('');
    
    const filteredEmployees = searchTerm
        ? employees.filter(e =>
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
          ).slice(0, 5)
        : [];

    const availablePpeForDelivery = ppeItems.filter(p => (parseFloat(String(p.stock)) || 0) > 0);

    const handleSelectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setSearchTerm('');
    };

    const handleClearEmployee = () => {
        setSelectedEmployee(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !ppeId || !deliveryType || !deliveryDate) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        onSave({
            employeeId: selectedEmployee.id,
            ppeId,
            quantity,
            date: deliveryDate,
            deliveryType,
            renewalDate: renewalDate || undefined
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!selectedEmployee ? (
                <div>
                    <label htmlFor="employee-search" className="block text-sm font-bold text-gray-700 mb-2">1. Buscar Empleado</label>
                    <input
                        id="employee-search"
                        type="text"
                        placeholder="Buscar por nombre o número..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        aria-label="Buscar empleado"
                    />
                    {searchTerm && (
                        <ul className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => (
                                    <li key={emp.id} onClick={() => handleSelectEmployee(emp)} className="p-3 hover:bg-gray-100 cursor-pointer" role="option" aria-selected="false">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="font-semibold text-dark-text">{emp.name}</span>
                                            <span className="text-sm text-medium-text">Nº: {emp.employeeNumber}</span>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-gray-500 text-sm">No se encontraron empleados.</li>
                            )}
                        </ul>
                    )}
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">1. Empleado Seleccionado</label>
                    <div className="mt-1 p-4 border border-green-300 bg-green-50 rounded-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg text-dark-text">{selectedEmployee.name}</p>
                                <p className="text-sm text-medium-text"><strong>Nº:</strong> {selectedEmployee.employeeNumber}</p>
                                <p className="text-sm text-medium-text"><strong>Puesto:</strong> {selectedEmployee.position}</p>
                                <p className="text-sm text-medium-text"><strong>Área:</strong> {selectedEmployee.department}</p>
                            </div>
                            <button type="button" onClick={handleClearEmployee} className="text-sm text-blue-600 hover:text-blue-800 font-semibold" aria-label="Cambiar empleado">
                                Cambiar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <div className="space-y-4 pt-4 border-t mt-4">
                    <div>
                        <label htmlFor="ppe-select" className="block text-sm font-bold text-gray-700 mb-2">2. Seleccionar EPP</label>
                        <select id="ppe-select" value={ppeId} onChange={e => setPpeId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-dark-text rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required>
                            <option value="" className="text-gray-500">Seleccione un EPP</option>
                            {availablePpeForDelivery.map(p => <option key={p.id} value={p.id} className="text-dark-text">{`${p.name} - ${p.type} / ${p.size} (Stock: ${p.stock})`}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">3. Cantidad</label>
                        <input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="delivery-type" className="block text-sm font-bold text-gray-700 mb-2">4. Tipo de Entrega</label>
                            <select id="delivery-type" value={deliveryType} onChange={e => setDeliveryType(e.target.value as DeliveryType)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white text-dark-text rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required>
                                <option className="text-dark-text" value="Ingreso">Ingreso</option>
                                <option className="text-dark-text" value="Renovación">Renovación</option>
                                <option className="text-dark-text" value="Reposición">Reposición</option>
                                <option className="text-dark-text" value="Visitas">Visitas</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="delivery-date" className="block text-sm font-bold text-gray-700 mb-2">5. Fecha de Entrega</label>
                            <input id="delivery-date" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="renewal-date" className="block text-sm font-bold text-gray-700 mb-2">6. Fecha de Renovación (Opcional)</label>
                        <input id="renewal-date" type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50" disabled={!selectedEmployee || !ppeId}>Enviar para Aprobación</button>
            </div>
        </form>
    );
};

const StockAdjustmentForm: React.FC<{
    details: { itemName: string, currentStock: number, adjustmentType: 'in' | 'out' };
    onSave: (quantity: number) => void;
    onClose: () => void;
}> = ({ details, onSave, onClose }) => {
    const [quantity, setQuantity] = useState<number>(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            alert("La cantidad debe ser un número positivo.");
            return;
        }
        onSave(quantity);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <p className="text-gray-700">Ajustando stock para: <span className="font-bold">{details.itemName}</span></p>
                <p className="text-sm text-gray-500">Stock actual: {details.currentStock}</p>
            </div>
            <div>
                <label htmlFor="adjustment-quantity" className="block text-sm font-medium text-gray-700">
                    Cantidad a {details.adjustmentType === 'in' ? 'Ingresar' : 'Retirar'}
                </label>
                <input
                    id="adjustment-quantity"
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    min="1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    required
                    autoFocus
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                    Confirmar {details.adjustmentType === 'in' ? 'Ingreso' : 'Salida'}
                </button>
            </div>
        </form>
    );
};


const PPE: React.FC = () => {
    const [ppeItems, setPpeItems] = useLocalStorage<PpeItem[]>('ppe_items', []);
    const [deliveries, setDeliveries] = useLocalStorage<PpeDelivery[]>('ppe_deliveries', []);
    const [employees] = useLocalStorage<Employee[]>('employees', []);
    const [users] = useLocalStorage<User[]>('users', []);
    const { hasPermission, currentUser } = useAuth();
    
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [currentDeliveryForReceipt, setCurrentDeliveryForReceipt] = useState<PpeDelivery | null>(null);
    const [deliverySearchTerm, setDeliverySearchTerm] = useState('');

    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [adjustmentDetails, setAdjustmentDetails] = useState<{
        itemId: string;
        adjustmentType: 'in' | 'out';
        itemName: string;
        currentStock: number;
    } | null>(null);

    const handleSaveItem = (itemData: Omit<PpeItem, 'id'>) => {
        const newItem: PpeItem = { id: new Date().toISOString(), ...itemData };
        setPpeItems(prev => [...prev, newItem]);
        setIsItemModalOpen(false);
    };
    
    const handleOpenStockAdjustment = (itemId: string, adjustmentType: 'in' | 'out') => {
        const itemToAdjust = ppeItems.find(p => p.id === itemId);
        if (!itemToAdjust) return;

        setAdjustmentDetails({
            itemId,
            adjustmentType,
            itemName: `${itemToAdjust.name} (${itemToAdjust.type} / ${itemToAdjust.size})`,
            currentStock: parseFloat(String(itemToAdjust.stock)) || 0,
        });
        setIsAdjustmentModalOpen(true);
    };
    
    const handleConfirmStockAdjustment = (quantity: number) => {
        if (!adjustmentDetails) return;

        const { itemId, adjustmentType, currentStock } = adjustmentDetails;

        if (adjustmentType === 'out' && quantity > currentStock) {
            alert('No se puede retirar más stock del disponible.');
            return;
        }

        setPpeItems(prevItems =>
            prevItems.map(p => {
                if (p.id === itemId) {
                    const prevStock = parseFloat(String(p.stock)) || 0;
                    const newStock = adjustmentType === 'in' ? prevStock + quantity : prevStock - quantity;
                    return { ...p, stock: newStock };
                }
                return p;
            })
        );

        setIsAdjustmentModalOpen(false);
        setAdjustmentDetails(null);
    };


    const handleSaveDelivery = (deliveryData: Omit<PpeDelivery, 'id' | 'folio' | 'status' | 'requestedByUserId' | 'approvedByUserId'>) => {
        const lastFolioNumber = deliveries.reduce((max, d) => {
            if (!d.folio) return max;
            const num = parseInt(d.folio.split('-')[1], 10);
            return num > max ? num : max;
        }, 0);
        const newFolio = `F-${String(lastFolioNumber + 1).padStart(4, '0')}`;

        const newDelivery: PpeDelivery = { 
            id: new Date().toISOString(),
            folio: newFolio,
            ...deliveryData,
            status: 'En espera',
            requestedByUserId: currentUser!.id,
        };

        setDeliveries(prev => [newDelivery, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsDeliveryModalOpen(false);
        alert('Solicitud de entrega enviada para aprobación.');
    };
    
    const handleApproveDelivery = (deliveryId: string) => {
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (!delivery) return;

        const ppeItem = ppeItems.find(p => p.id === delivery.ppeId);
        if (!ppeItem) {
            alert('Error: EPP no encontrado.');
            return;
        }

        const currentStock = parseFloat(String(ppeItem.stock)) || 0;
        if (currentStock < delivery.quantity) {
            alert('Stock insuficiente para aprobar esta entrega. Por favor, actualice el inventario.');
            return;
        }

        // Update delivery status
        setDeliveries(prev => 
            prev.map(d => 
                d.id === deliveryId 
                    ? { ...d, status: 'Aprobado', approvedByUserId: currentUser!.id } 
                    : d
            )
        );

        // Deduct stock
        setPpeItems(prev => 
            prev.map(p => {
                if (p.id === delivery.ppeId) {
                    const prevStock = parseFloat(String(p.stock)) || 0;
                    return { ...p, stock: prevStock - delivery.quantity };
                }
                return p;
            })
        );
    };

    const handlePrintReceipt = (delivery: PpeDelivery) => {
        setCurrentDeliveryForReceipt(delivery);
        setIsReceiptModalOpen(true);
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'N/A';
    const getPpeName = (id: string) => {
        const item = ppeItems.find(p => p.id === id);
        if (!item) return 'EPP no encontrado';
        return `${item.name} (${item.type} / ${item.size})`;
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        if (!deliverySearchTerm) return true;
        const employee = employees.find(e => e.id === delivery.employeeId);
        if (!employee) return false;
        const searchTermLower = deliverySearchTerm.toLowerCase();
        return (
            employee.name.toLowerCase().includes(searchTermLower) ||
            employee.employeeNumber.toLowerCase().includes(searchTermLower)
        );
    });

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark-text">Inventario de EPP</h2>
                    {hasPermission('manage_ppe') && (
                        <button onClick={() => setIsItemModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">
                            + Agregar Variante de EPP
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo / Material</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talla</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                {hasPermission('manage_ppe') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {ppeItems.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-dark-text">{item.stock}</td>
                                    {hasPermission('manage_ppe') && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleOpenStockAdjustment(item.id, 'in')} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 font-semibold">
                                                + Ingresar
                                            </button>
                                            <button onClick={() => handleOpenStockAdjustment(item.id, 'out')} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 font-semibold">
                                                - Salida
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                             {ppeItems.length === 0 && (
                                <tr><td colSpan={hasPermission('manage_ppe') ? 5: 4} className="text-center py-4 text-gray-500">No hay EPP en inventario. Agregue una variante para comenzar.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                    <h2 className="text-xl font-bold text-dark-text">Registro de Entregas de EPP</h2>
                     <div className="flex items-center space-x-4">
                        <input
                            type="text"
                            placeholder="Buscar por empleado..."
                            value={deliverySearchTerm}
                            onChange={e => setDeliverySearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                         {hasPermission('manage_ppe') && (
                            <button onClick={() => setIsDeliveryModalOpen(true)} className="px-4 py-2 bg-secondary text-dark-text rounded-md hover:bg-yellow-500 font-semibold flex-shrink-0">
                                + Registrar Entrega
                            </button>
                        )}
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Entrega</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPP Entregado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDeliveries.map(d => (
                                <tr key={d.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{d.folio}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.date + 'T00:00:00').toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{getEmployeeName(d.employeeId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{getPpeName(d.ppeId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            d.status === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {d.status === 'Aprobado' && (
                                            <button onClick={() => handlePrintReceipt(d)} className="text-gray-600 hover:text-primary" title="Imprimir Comprobante">
                                                <PrinterIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        {currentUser?.level === 'Administrador' && d.status === 'En espera' && (
                                            <button onClick={() => handleApproveDelivery(d.id)} className="text-green-600 hover:text-green-900" title="Aprobar Entrega">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredDeliveries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">
                                        {deliveries.length > 0 ? 'No se encontraron entregas con ese criterio.' : 'No hay entregas registradas.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {hasPermission('manage_ppe') && (
                <>
                    <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Agregar Variante de EPP al Inventario">
                        <PpeItemForm onSave={handleSaveItem} onClose={() => setIsItemModalOpen(false)} />
                    </Modal>
                    <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} title="Registrar Nueva Entrega de EPP">
                        <PpeDeliveryForm onSave={handleSaveDelivery} onClose={() => {setIsDeliveryModalOpen(false)}} employees={employees} ppeItems={ppeItems} />
                    </Modal>
                    <Modal isOpen={isAdjustmentModalOpen} onClose={() => setIsAdjustmentModalOpen(false)} title="Ajustar Stock de EPP">
                        {adjustmentDetails && (
                            <StockAdjustmentForm
                                details={adjustmentDetails}
                                onSave={handleConfirmStockAdjustment}
                                onClose={() => setIsAdjustmentModalOpen(false)}
                            />
                        )}
                    </Modal>
                </>
            )}
            <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title={`Comprobante de Entrega - Folio ${currentDeliveryForReceipt?.folio || ''}`}>
                {currentDeliveryForReceipt && (
                    <DeliveryReceipt 
                        delivery={currentDeliveryForReceipt} 
                        employee={employees.find(e => e.id === currentDeliveryForReceipt.employeeId)}
                        ppeItem={ppeItems.find(p => p.id === currentDeliveryForReceipt.ppeId)}
                        responsibleUser={users.find(u => u.id === currentDeliveryForReceipt.requestedByUserId) || null}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PPE;
