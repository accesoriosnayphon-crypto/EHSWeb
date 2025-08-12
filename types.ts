


export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  department: string;
  position: string;
}

export interface PpeItem {
  id: string;
  name: string;
  type: string;
  size: string;
  stock: number;
}

export type DeliveryType = 'Ingreso' | 'Renovación' | 'Reposición' | 'Visitas';
export type ApprovalStatus = 'En espera' | 'Aprobado';


export interface PpeDelivery {
  id: string;
  folio: string;
  employeeId: string;
  ppeId: string;
  quantity: number;
  date: string; // Delivery date
  deliveryType: DeliveryType;
  renewalDate?: string; // Optional renewal date
  status: ApprovalStatus;
  requestedByUserId: string;
  approvedByUserId?: string;
}

export type EventType = 'Accidente' | 'Incidente' | 'Condición Insegura' | 'Acto Inseguro';

export interface Incident {
  id: string;
  folio: string;
  employeeId: string | null;
  date: string;
  time: string;
  eventType: EventType;
  machineOrOperation: string;
  area: string;
  description: string;
  treatment: string;
  evidenceImageUrl?: string;
}

export type TrainingType = 'Interna' | 'Externa';

export interface Training {
    id: string;
    topic: string;
    date: string;
    trainingType: TrainingType;
    instructor: string;
    durationHours: number;
    attendees: string[]; // array of employee IDs
}

export type ViolationType =
  | 'Falta de lentes de seguridad'
  | 'Falta de botas de seguridad'
  | 'Falta de mascarilla / respirador'
  | 'Falta de mandil / delantal'
  | 'Falta de guantes'
  | 'Falta de casco'
  | 'Uso incorrecto del equipo'
  | 'Equipo en mal estado';

export const VIOLATION_TYPES: ViolationType[] = [
  'Falta de lentes de seguridad',
  'Falta de botas de seguridad',
  'Falta de mascarilla / respirador',
  'Falta de mandil / delantal',
  'Falta de guantes',
  'Falta de casco',
  'Uso incorrecto del equipo',
  'Equipo en mal estado',
];


export interface Inspection {
  id: string;
  employeeId: string;
  date: string;
  violation: boolean;
  violations: ViolationType[]; // Will be empty if violation is false
  observations: string;
}

// --- Safety Inspection Types ---

export const EQUIPMENT_TYPES = ['Extintor', 'Hidrante', 'Salida de Emergencia', 'Lámpara de Emergencia', 'Rampa', 'Lavaojos', 'Ducha de Seguridad', 'Otro'] as const;
export type EquipmentType = typeof EQUIPMENT_TYPES[number];

export interface SafetyEquipment {
  id: string;
  name: string; // e.g., "Extintor Pasillo A"
  type: EquipmentType;
  location: string;
  inspectionFrequency: number; // in days
  lastInspectionDate?: string;
}

export type SafetyInspectionLogStatus = 'OK' | 'Reparación Requerida' | 'Reemplazo Requerido';

export interface SafetyInspectionLog {
  id: string;
  equipmentId: string;
  inspectionDate: string;
  status: SafetyInspectionLogStatus;
  notes: string;
  inspectorId: string; // User ID
}

// --- Activity Management Types ---

export type ActivityType = 'Interna' | 'Externa';
export type ActivityPriority = 'Baja' | 'Media' | 'Alta';
export type ActivityStatus = 'Pendiente' | 'En Progreso' | 'Completada';

export interface Activity {
  id: string;
  registrationDate: string;
  commitmentDate: string;
  description: string;
  type: ActivityType;
  provider?: string;
  estimatedCost: number;
  priority: ActivityPriority;
  status: ActivityStatus;
  comments: string;
  responsibleUserId: string;
  sourceAuditId?: string; // ID of the source audit
  sourceFindingId?: string; // ID of the source finding
}

// --- JHA / Risk Management Types ---

export type JhaRiskLevel = 'Bajo' | 'Medio' | 'Alto';
export const JHA_RISK_LEVELS: JhaRiskLevel[] = ['Bajo', 'Medio', 'Alto'];

export interface JhaHazard {
    id: string;
    description: string;
    controls: string;
    riskLevel: JhaRiskLevel;
}

export interface JhaStep {
    id: string;
    description: string;
    hazards: JhaHazard[];
}

export interface Jha {
    id: string;
    title: string;
    area: string;
    creationDate: string;
    steps: JhaStep[];
}

// --- Chemical Inventory Types ---

export type PictogramKey = 
  | 'explosive' 
  | 'flammable' 
  | 'oxidizing' 
  | 'compressed_gas' 
  | 'corrosive' 
  | 'toxic' 
  | 'harmful' 
  | 'health_hazard' 
  | 'environmental_hazard';

export interface Chemical {
  id: string;
  name: string;
  provider: string;
  casNumber?: string;
  location: string;
  sdsUrl: string; // Will store the Base64 data URL
  pictograms: PictogramKey[];
}

// --- Work Permit Types ---

export const WORK_PERMIT_TYPES = ['Trabajo en Caliente', 'Trabajo en Altura', 'Espacio Confinado', 'Eléctrico', 'Otro'] as const;
export type WorkPermitType = typeof WORK_PERMIT_TYPES[number];

export const WORK_PERMIT_STATUSES = ['Solicitado', 'Aprobado', 'Rechazado', 'En Progreso', 'Cerrado'] as const;
export type WorkPermitStatus = typeof WORK_PERMIT_STATUSES[number];

export interface WorkPermit {
  id: string;
  folio: string;
  title: string;
  type: WorkPermitType;
  status: WorkPermitStatus;
  requestDate: string; // ISO date string
  validFrom?: string; // ISO datetime string
  validTo?: string; // ISO datetime string
  closeDate?: string; // ISO date string
  requesterUserId: string;
  approverUserId?: string;
  closerUserId?: string;
  description: string;
  location: string;
  equipment: string[]; // List of equipment to be used, as strings
  ppe: string[]; // List of required PPE, as strings
  jhaId?: string; // Optional linked JHA
  notes?: string;
}

// --- Waste Management Types ---

export const WASTE_TYPES = ['Peligroso', 'No Peligroso', 'Reciclable'] as const;
export type WasteType = typeof WASTE_TYPES[number];
export const WASTE_UNITS = ['Kg', 'L', 'Unidades', 'Tambores'] as const;
export type WasteUnit = typeof WASTE_UNITS[number];

export interface Waste {
  id: string;
  name: string;
  type: WasteType;
  storageLocation: string;
  disposalMethod: string;
}

export interface WasteLog {
  id: string;
  folio: string;
  wasteId: string;
  date: string; // disposal date
  quantity: number;
  unit: WasteUnit;
  manifestNumber?: string;
  manifestUrl?: string; // Data URL for uploaded manifest PDF/image
  disposalCompany?: string;
  cost?: number;
  recordedByUserId: string;
}

// --- Audits & Compliance Types ---
export type AuditFindingType = 'No Conformidad' | 'Observación' | 'Oportunidad de Mejora';
export const AUDIT_FINDING_TYPES: AuditFindingType[] = ['No Conformidad', 'Observación', 'Oportunidad de Mejora'];

export type AuditFindingSeverity = 'Mayor' | 'Menor';
export const AUDIT_FINDING_SEVERITIES: AuditFindingSeverity[] = ['Mayor', 'Menor'];

export type AuditFindingStatus = 'Abierta' | 'Cerrada';
export const AUDIT_FINDING_STATUSES: AuditFindingStatus[] = ['Abierta', 'Cerrada'];

export interface AuditFinding {
    id: string;
    auditId: string;
    description: string;
    type: AuditFindingType;
    severity: AuditFindingSeverity;
    status: AuditFindingStatus;
    reference: string; // Clause of the standard, e.g., "ISO 45001: 8.1.2"
}

export interface Audit {
    id: string;
    folio: string;
    title: string;
    standard: string; // e.g., "ISO 45001:2018", "Auditoría Interna de Seguridad"
    scope: string; // Areas or processes audited
    startDate: string;
    endDate: string;
    leadAuditorId: string; // User ID
    auditorIds: string[]; // User IDs
    findings: AuditFinding[];
}

// --- App Settings ---
export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyLogo: string; // Base64 Data URL
}


// --- User Management Types ---

export type Permission = 
  | 'view_dashboard'
  | 'manage_employees'
  | 'manage_ppe'
  | 'manage_incidents'
  | 'manage_trainings'
  | 'manage_inspections'
  | 'manage_safety_inspections'
  | 'manage_jha'
  | 'manage_chemicals'
  | 'manage_activities'
  | 'manage_work_permits'
  | 'manage_waste'
  | 'manage_audits'
  | 'view_reports'
  | 'manage_users'
  | 'manage_settings';

export const PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'view_dashboard', label: 'Ver Dashboard' },
  { id: 'manage_employees', label: 'Gestionar Empleados' },
  { id: 'manage_ppe', label: 'Gestionar EPP' },
  { id: 'manage_incidents', label: 'Gestionar Incidentes' },
  { id: 'manage_trainings', label: 'Gestionar Capacitaciones' },
  { id: 'manage_inspections', label: 'Gestionar Insp. EPP' },
  { id: 'manage_safety_inspections', label: 'Gestionar Insp. de Seguridad' },
  { id: 'manage_jha', label: 'Gestionar JHA' },
  { id: 'manage_chemicals', label: 'Gestionar Inventario Químico' },
  { id: 'manage_activities', label: 'Gestionar Actividades' },
  { id: 'manage_work_permits', label: 'Gestionar Permisos de Trabajo' },
  { id: 'manage_waste', label: 'Gestionar Residuos' },
  { id: 'manage_audits', label: 'Gestionar Auditorías'},
  { id: 'view_reports', label: 'Ver Reportes' },
  { id: 'manage_users', label: 'Gestionar Usuarios' },
  { id: 'manage_settings', label: 'Gestionar Configuración' },
];

export type UserLevel = 'Administrador' | 'Supervisor' | 'Operador';

export interface User {
  id: string;
  employeeNumber: string;
  password: string; 
  fullName: string;
  level: UserLevel;
  permissions: Permission[];
}