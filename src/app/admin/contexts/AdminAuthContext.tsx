// src/app/admin/contexts/AdminAuthContext.tsx
'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// URL base de tu backend Node.js para el admin.
const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL || 'http://localhost:5000'; 

// Interfaz explícita para el objeto de usuario del administrador
interface AdminUser {
    id: string;
    username: string;
    role: string;
}

interface AuthContextType {
    token: string | null;
    user: AdminUser | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Inicializa el token desde las cookies al cargar el componente
    const [token, setToken] = useState<string | null>(Cookies.get('admin_token') || null);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
    const router = useRouter();

    // Función para decodificar un token JWT
    const decodeToken = useCallback((jwtToken: string | null) => { // Acepta string | null
        // ¡CORRECCIÓN CLAVE AQUÍ! Verifica que jwtToken no sea null/undefined y que tenga al menos dos partes.
        if (!jwtToken || jwtToken.split('.').length < 2) {
            console.error('Token JWT inválido o incompleto:', jwtToken);
            return null; 
        }
        try {
            const base64Url = jwtToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decodificando el token:', error);
            return null;
        }
    }, []);

    // Función para iniciar sesión: guarda el token y decodifica el usuario
    const login = useCallback((newToken: string) => {
        Cookies.set('admin_token', newToken, { expires: 1, path: '/' }); 
        setToken(newToken);
        const decodedUser = decodeToken(newToken);
        if (decodedUser) {
            setUser({ id: decodedUser.id, username: decodedUser.username, role: decodedUser.role });
        }
    }, [decodeToken]);

    // Función para cerrar sesión: elimina el token y los datos del usuario
    const logout = useCallback(() => {
        Cookies.remove('admin_token', { path: '/' }); 
        setToken(null);
        setUser(null);
        router.push('/admin/login'); 
    }, [router]);

    // Efecto para verificar el token al cargar o cuando el token cambia
    useEffect(() => {
        // Llama a decodeToken solo si 'token' no es null
        if (token) {
            const decodedUser = decodeToken(token);
            // Verifica si el token existe, es válido y no ha expirado
            if (decodedUser && decodedUser.exp * 1000 > Date.now()) { 
                setUser({ id: decodedUser.id, username: decodedUser.username, role: decodedUser.role });
            } else {
                logout(); // Si el token ha expirado o es inválido, cierra la sesión
            }
        }
        setLoadingAuth(false); // La carga inicial de autenticación ha terminado
    }, [token, decodeToken, logout]);

    // Determina si el usuario está autenticado
    const isAuthenticated = !!token && !!user;

    const authContextValue = {
        token,
        user,
        login,
        logout,
        isAuthenticated,
        loadingAuth,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
