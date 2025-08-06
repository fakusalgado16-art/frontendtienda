'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Define la interfaz para el contexto de autenticación
interface AuthContextType {
    user: User | null; // El tipo es directamente User de Supabase
    isLoading: boolean; // Indica si la carga inicial de autenticación ha terminado
    signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
    logout: () => Promise<void>;
    // Nueva función para actualizar los metadatos del usuario
    updateUserMetadata: (updates: { name?: string | null; phone?: string | null }) => Promise<{ success: boolean; error: string | null }>;
}

// Crea el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inicializa el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null); // El estado ahora es de tipo User
    const [isLoading, setIsLoading] = useState(true); // True inicialmente para indicar que estamos cargando el estado de auth

    // Efecto para escuchar cambios en el estado de autenticación de Supabase
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Si hay una sesión activa, establecemos el usuario de Supabase
                // Esto incluirá user_metadata actualizado si se modificó
                setUser(session.user);
            } else {
                // Si no hay sesión, el usuario es nulo
                setUser(null);
            }
            setIsLoading(false); // La carga inicial ha terminado
        });

        // Limpieza del listener
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []); // Se ejecuta solo una vez al montar el componente

    // Función para iniciar sesión
    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setIsLoading(false);
        if (error) {
            console.error('Login error:', error.message);
            return { success: false, error: error.message };
        }
        // El onAuthStateChange se encargará de actualizar el estado 'user'
        return { success: true, error: null };
    };

    // Función para registrar un nuevo usuario
    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            // No se pasa 'name' aquí, se actualizará en el perfil si el usuario lo desea
        });
        setIsLoading(false);
        if (error) {
            console.error('Signup error:', error.message);
            return { success: false, error: error.message };
        }
        // El onAuthStateChange se encargará de actualizar el estado 'user'
        return { success: true, error: null };
    };

    // Función para cerrar sesión
    const logout = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        setIsLoading(false);
        if (error) {
            console.error('Logout error:', error.message);
        } else {
            setUser(null); // Limpiar el usuario del estado local
        }
    };

    // Nueva función para actualizar los metadatos del usuario
    const updateUserMetadata = async (updates: { name?: string | null; phone?: string | null }) => {
        if (!user) {
            return { success: false, error: 'Usuario no autenticado.' };
        }

        const { data, error } = await supabase.auth.updateUser({
            data: { ...user.user_metadata, ...updates }, // Fusiona los metadatos existentes con las actualizaciones
        });

        if (error) {
            console.error('Error updating user metadata:', error.message);
            return { success: false, error: error.message };
        }

        // El onAuthStateChange se encargará de actualizar el estado 'user' automáticamente
        // No necesitamos llamar a setUser aquí directamente porque el listener lo hará.
        return { success: true, error: null };
    };


    const value = {
        user,
        isLoading,
        signIn,
        signUp,
        logout,
        updateUserMetadata, // Añadido al valor del contexto
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
