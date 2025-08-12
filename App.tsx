import React, { useState, useEffect } from 'react';
import { HashRouter, Route, Routes, NavLink, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import PPE from './pages/PPE';
import Incidents from './pages/Incidents';
import Training from './pages/Training';
import Inspections from './pages/Inspections';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SafetyInspections from './pages/SafetyInspections';
import Activities from './pages/Activities';
import RiskManagement from './pages/RiskManagement';
import Chemicals from './pages/Chemicals';
import WorkPermits from './pages/WorkPermits';
import WasteManagement from './pages/WasteManagement';
import Settings from './pages/Settings';
import Audits from './pages/Audits';
import { AuthProvider, useAuth } from './Auth';
import { HomeIcon, UserGroupIcon, ShieldCheckIcon, ExclamationTriangleIcon, AcademicCapIcon, ChartBarIcon, ClipboardDocumentCheckIcon, UsersIcon, ArrowLeftOnRectangleIcon, ShieldExclamationIcon, CalendarDaysIcon, DocumentMagnifyingGlassIcon, VialIcon, ChevronDownIcon, BriefcaseIcon, ArrowPathIcon, Cog6ToothIcon, DocumentCheckIcon } from './constants';
import { Permission } from './types';


const navGroups = [
    {
        name: 'General',
        links: [
            { permission: 'view_dashboard' as Permission, path: '/', label: 'Dashboard', icon: <HomeIcon className="w-6 h-6" /> },
            { permission: 'view_reports' as Permission, path: '/reports', label: 'Reportes', icon: <ChartBarIcon className="w-6 h-6" /> },
        ]
    },
    {
        name: 'Gestión Humana',
        links: [
             { permission: 'manage_employees' as Permission, path: '/employees', label: 'Empleados', icon: <UserGroupIcon className="w-6 h-6" /> },
             { permission: 'manage_trainings' as Permission, path: '/training', label: 'Capacitaciones', icon: <AcademicCapIcon className="w-6 h-6" /> },
             { permission: 'manage_users' as Permission, path: '/users', label: 'Usuarios', icon: <UsersIcon className="w-6 h-6" /> },
        ]
    },
    {
        name: 'Operaciones EHS',
        links: [
            { permission: 'manage_ppe' as Permission, path: '/ppe', label: 'EPP', icon: <ShieldCheckIcon className="w-6 h-6" /> },
            { permission: 'manage_incidents' as Permission, path: '/incidents', label: 'Incidentes', icon: <ExclamationTriangleIcon className="w-6 h-6" /> },
            { permission: 'manage_inspections' as Permission, path: '/inspections', label: 'Insp. EPP', icon: <ClipboardDocumentCheckIcon className="w-6 h-6" /> },
            { permission: 'manage_safety_inspections' as Permission, path: '/safety-inspections', label: 'Insp. de Seguridad', icon: <ShieldExclamationIcon className="w-6 h-6" /> },
            { permission: 'manage_chemicals' as Permission, path: '/chemicals', label: 'Inventario Químico', icon: <VialIcon className="w-6 h-6" /> },
            { permission: 'manage_work_permits' as Permission, path: '/work-permits', label: 'Permisos de Trabajo', icon: <BriefcaseIcon className="w-6 h-6" /> },
            { permission: 'manage_waste' as Permission, path: '/waste-management', label: 'Gestión de Residuos', icon: <ArrowPathIcon className="w-6 h-6" /> },
        ]
    },
    {
        name: 'Análisis y Planificación',
        links: [
            { permission: 'manage_activities' as Permission, path: '/activities', label: 'Actividades', icon: <CalendarDaysIcon className="w-6 h-6" /> },
            { permission: 'manage_jha' as Permission, path: '/risk-management', label: 'Gestión de Riesgos', icon: <DocumentMagnifyingGlassIcon className="w-6 h-6" /> },
            { permission: 'manage_audits' as Permission, path: '/audits', label: 'Auditorías', icon: <DocumentCheckIcon className="w-6 h-6" /> },
        ]
    },
    {
        name: 'Configuración',
        links: [
            { permission: 'manage_settings' as Permission, path: '/settings', label: 'Ajustes', icon: <Cog6ToothIcon className="w-6 h-6" /> },
        ]
    }
];

const allNavLinks = navGroups.flatMap(group => group.links);


const Sidebar: React.FC = () => {
  const { hasPermission, logout, currentUser } = useAuth();
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  
  const availableNavGroups = navGroups.map(group => ({
        ...group,
        links: group.links.filter(link => hasPermission(link.permission))
    })).filter(group => group.links.length > 0);

  useEffect(() => {
    const currentGroup = availableNavGroups.find(group => 
        group.links.some(link => link.path === location.pathname)
    );
    if (currentGroup) {
        setOpenGroup(currentGroup.name);
    }
  }, [location.pathname]);

  const toggleGroup = (groupName: string) => {
    setOpenGroup(prev => (prev === groupName ? null : groupName));
  };


  return (
    <div className="w-64 bg-primary text-white flex flex-col min-h-screen">
      <div className="p-6 text-2xl font-bold border-b border-primary-dark">
        EHS Manager
      </div>
      <nav className="flex-grow p-2 space-y-1">
        {availableNavGroups.map((group) => (
          <div key={group.name}>
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full flex items-center justify-between p-3 my-1 rounded-lg hover:bg-primary-dark/50 transition-colors duration-200"
            >
              <span className="font-semibold">{group.name}</span>
              <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${openGroup === group.name ? 'rotate-180' : ''}`} />
            </button>
            {openGroup === group.name && (
              <div className="pl-4 mt-1 space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-sm ${
                        isActive ? 'bg-primary-dark' : 'hover:bg-primary-dark/50'
                      }`
                    }
                  >
                    {link.icon}
                    <span className="ml-3">{link.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-dark">
            <div className="text-center mb-2">
                <p className="text-sm font-semibold truncate" title={currentUser?.fullName}>{currentUser?.fullName}</p>
                <p className="text-xs opacity-75">{currentUser?.level}</p>
            </div>
            <button
                onClick={logout}
                className="flex items-center justify-center w-full p-3 my-2 rounded-lg transition-colors duration-200 bg-red-500 hover:bg-red-600"
            >
                <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                <span className="ml-4">Cerrar Sesión</span>
            </button>
        </div>
    </div>
  );
};


const Header: React.FC = () => {
    const location = useLocation();
    const currentLink = allNavLinks.find(link => link.path === location.pathname);
    const title = currentLink ? currentLink.label : 'Dashboard';

    return (
        <header className="bg-white shadow-md p-4">
            <h1 className="text-2xl font-bold text-dark-text">{title}</h1>
        </header>
    );
}

const ProtectedLayout: React.FC = () => {
    const { hasPermission } = useAuth();
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1">
                <Header />
                <div className="p-6">
                    <Routes>
                        {hasPermission('view_dashboard') && <Route path="/" element={<Dashboard />} />}
                        {hasPermission('manage_employees') && <Route path="/employees" element={<Employees />} />}
                        {hasPermission('manage_ppe') && <Route path="/ppe" element={<PPE />} />}
                        {hasPermission('manage_incidents') && <Route path="/incidents" element={<Incidents />} />}
                        {hasPermission('manage_trainings') && <Route path="/training" element={<Training />} />}
                        {hasPermission('manage_inspections') && <Route path="/inspections" element={<Inspections />} />}
                        {hasPermission('manage_safety_inspections') && <Route path="/safety-inspections" element={<SafetyInspections />} />}
                        {hasPermission('manage_jha') && <Route path="/risk-management" element={<RiskManagement />} />}
                        {hasPermission('manage_chemicals') && <Route path="/chemicals" element={<Chemicals />} />}
                        {hasPermission('manage_work_permits') && <Route path="/work-permits" element={<WorkPermits />} />}
                        {hasPermission('manage_waste') && <Route path="/waste-management" element={<WasteManagement />} />}
                        {hasPermission('manage_activities') && <Route path="/activities" element={<Activities />} />}
                        {hasPermission('manage_audits') && <Route path="/audits" element={<Audits />} />}
                        {hasPermission('manage_users') && <Route path="/users" element={<Users />} />}
                        {hasPermission('view_reports') && <Route path="/reports" element={<Reports />} />}
                        {hasPermission('manage_settings') && <Route path="/settings" element={<Settings />} />}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};


const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    return (
         <Routes>
            {!currentUser ? (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            ) : (
                <Route path="/*" element={<ProtectedLayout />} />
            )}
        </Routes>
    )
}

const App: React.FC = () => {
  return (
    <HashRouter>
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    </HashRouter>
  );
};

export default App;