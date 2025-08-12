

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { User, Permission, PERMISSIONS } from './types';

interface AuthContextType {
    currentUser: User | null;
    login: (employeeNumber: string, password_raw: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useLocalStorage<User[]>('users', []);
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Create a default admin user if no users exist
    useEffect(() => {
        if (users.length === 0) {
            const adminUser: User = {
                id: 'default_admin_001',
                employeeNumber: 'admin',
                password: 'admin',
                fullName: 'Administrador del Sistema',
                level: 'Administrador',
                permissions: PERMISSIONS.map(p => p.id),
            };
            setUsers([adminUser]);
            console.log('Default admin user created. User: admin, Pass: admin');
        }
    }, [users, setUsers]);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const login = async (employeeNumber: string, password_raw: string): Promise<boolean> => {
        const userToLogin = users.find(u => u.employeeNumber === employeeNumber);
        
        if (userToLogin && userToLogin.password === password_raw) {
            setCurrentUser(userToLogin);
            return true;
        }
        
        // In case of old data structure with password_hash
        if (userToLogin && (userToLogin as any).password_hash === password_raw) {
             setCurrentUser(userToLogin);
             return true;
        }

        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('currentUser');
    };
    
    const hasPermission = (permission: Permission): boolean => {
        return currentUser?.permissions.includes(permission) ?? false;
    };

    const value = { currentUser, login, logout, hasPermission };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};