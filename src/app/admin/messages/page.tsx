'use client'; // Componente de cliente

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js'; // Importar Supabase client
import { useRouter } from 'next/navigation'; // Importar useRouter para redirección
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { useAuth } from '../contexts/AdminAuthContext'; 

// =========================================================
// Configuración de Supabase
// =========================================================
// Asegúrate de que estas variables de entorno estén definidas en tu .env.local
// NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
// NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =========================================================
// Componentes de UI comunes
// =========================================================

// Componente de spinner de carga
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
    </div>
);

// Componente de caja de mensajes
interface MessageBoxProps {
    message: string | null;
    type: 'success' | 'error' | 'info';
    onClose?: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, type, onClose }) => {
    if (!message) return null;

    let bgColor = '';
    let textColor = '';
    switch (type) {
        case 'success':
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            break;
        case 'error':
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            break;
        case 'info':
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
            break;
    }

    return (
        <div className={`${bgColor} ${textColor} p-3 rounded-md mb-4 flex justify-between items-center`}>
            <span>{message}</span>
            {onClose && (
                <button onClick={onClose} className="text-current font-bold ml-4">
                    &times;
                </button>
            )}
        </div>
    );
};

// Interfaz para Mensaje
interface Message {
    id: string; // UUID de Supabase
    name: string;
    email: string;
    subject: string;
    message: string;
    timestamp: string;
    user_id: string | null;
    read: boolean;
}

export default function AdminMessagesPage() {
    const router = useRouter();
    const { isAuthenticated, loadingAuth } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [messageBox, setMessageBox] = useState<string | null>(null);
    const [messageBoxType, setMessageBoxType] = useState<'success' | 'error' | 'info'>('info');
    const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

    // Redirige si no está autenticado y la autenticación ha terminado de cargar
    useEffect(() => {
        if (!loadingAuth && !isAuthenticated) {
            router.replace('/admin/login');
        }
    }, [isAuthenticated, loadingAuth, router]);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        setMessageBox(null);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw new Error(error.message);

            setMessages(data || []);
        } catch (error: any) {
            setMessageBox(`Error al cargar mensajes: ${error.message}`);
            setMessageBoxType('error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!loadingAuth && isAuthenticated) {
            fetchMessages();
        }
    }, [fetchMessages, loadingAuth, isAuthenticated]);

    const handleToggleRead = async (id: string, currentReadStatus: boolean) => {
        setLoading(true);
        setMessageBox(null);
        try {
            const { data, error } = await supabase
                .from('messages')
                .update({ read: !currentReadStatus })
                .eq('id', id)
                .select();

            if (error) throw new Error(error.message);

            setMessageBox('Estado de lectura actualizado.');
            setMessageBoxType('success');
            fetchMessages();
        } catch (error: any) {
            setMessageBox(`Error: ${error.message}`);
            setMessageBoxType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        setLoading(true);
        setMessageBox(null);
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);

            setMessageBox('Mensaje eliminado exitosamente.');
            setMessageBoxType('success');
            fetchMessages();
        } catch (error: any) {
            setMessageBox(`Error: ${error.message}`);
            setMessageBoxType('error');
        } finally {
            setLoading(false);
        }
    };

    // NUEVA FUNCIÓN: Copiar el email al portapapeles
    const handleCopyEmail = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            Swal.fire('Copiado!', `El email "${email}" ha sido copiado al portapapeles.`, 'success');
        } catch (err) {
            console.error('Error al copiar el email:', err);
            Swal.fire('Error', 'No se pudo copiar el email al portapapeles.', 'error');
        }
    };

    const toggleMessageExpansion = (id: string) => {
        setExpandedMessageId(expandedMessageId === id ? null : id);
    };

    // Función para formatear la fecha
    const formatMessageDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Renderizado condicional para el spinner de carga inicial o si no está autenticado
    if (loadingAuth || (loading && isAuthenticated)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
                <p className="text-gray-700 text-lg">Cargando mensajes...</p>
            </div>
        );
    }

    // Si no está autenticado y ya no está cargando, no renderiza nada (la redirección se encarga)
    if (!isAuthenticated && !loadingAuth) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-4xl font-bold text-gray-800 mb-6">Gestión de Mensajes</h2>
                <MessageBox message={messageBox} type={messageBoxType} onClose={() => setMessageBox(null)} />

                {messages.length === 0 ? (
                    <p className="text-gray-600">No hay mensajes para mostrar.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">De</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Asunto</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Fecha</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Leído</th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {messages.map((msg) => (
                                    <React.Fragment key={msg.id}>
                                        <tr className={`${msg.read ? 'bg-gray-50 text-gray-500' : 'font-semibold text-gray-900'} hover:bg-gray-100 cursor-pointer`}
                                            onClick={() => toggleMessageExpansion(msg.id)}>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm">{msg.name} ({msg.email})</td>
                                            <td className="py-3 px-4 text-sm">{msg.subject}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm">{formatMessageDate(msg.timestamp)}</td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    msg.read ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {msg.read ? 'Sí' : 'No'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleRead(msg.id, msg.read); }}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    {msg.read ? 'Marcar como No Leído' : 'Marcar como Leído'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedMessageId === msg.id && (
                                            <tr>
                                                <td colSpan={5} className="p-4 bg-gray-50 border-t border-gray-200">
                                                    <div className="text-sm text-gray-700 mb-4">
                                                        <p className="font-semibold mb-2">Mensaje:</p>
                                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                                    </div>
                                                    {/* SECCIÓN DE COPIAR EMAIL */}
                                                    <div className="mt-4 p-3 bg-white rounded-md shadow-sm border border-gray-200 flex items-center justify-between">
                                                        <p className="font-semibold text-gray-800 mr-4">Email del Cliente: <span className="font-normal text-purple-700">{msg.email}</span></p>
                                                        <button
                                                            onClick={() => handleCopyEmail(msg.email)}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
                                                        >
                                                            Copiar Email
                                                        </button>
                                                    </div>
                                                    {/* FIN SECCIÓN DE COPIAR EMAIL */}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
