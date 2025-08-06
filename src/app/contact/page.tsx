// src/app/contact/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js'; // Import SupabaseClient type

// Initialize Supabase client
// Make sure these environment variables are set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null; // Explicitly type supabase as SupabaseClient or null

// Function to initialize Supabase client
const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL or Anon Key is missing. Please check your .env.local file.");
      return null;
    }
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
};


export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Explicitly type userId as string or null

  const client = getSupabaseClient();

  useEffect(() => {
    // Attempt to sign in anonymously to get a user ID for the message
    const signInAnonymously = async () => {
      if (!client) {
        console.error("Supabase client not initialized.");
        return;
      }
      try {
        const { data, error } = await client.auth.signInAnonymously();
        if (error) {
          console.error('Error signing in anonymously:', error.message);
          // Fallback to a random ID if anonymous sign-in fails
          setUserId(crypto.randomUUID());
        } else {
          setUserId(data.user?.id || crypto.randomUUID());
          console.log('Signed in anonymously with user ID:', data.user?.id);
        }
      } catch (err: unknown) { // Type err as unknown
        console.error('Exception during anonymous sign-in:', err);
        if (err instanceof Error) { // Check if err is an Error instance
          setUserId(crypto.randomUUID()); // Fallback
          // You could also set a status here if needed: setStatus(`Error: ${err.message}`);
        } else {
          setUserId(crypto.randomUUID()); // Fallback for non-Error objects
        }
      }
    };

    signInAnonymously();
  }, [client]); // Re-run if client changes (though it should be stable)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { // Explicitly type 'e'
    e.preventDefault();
    if (!client) {
      setStatus('Error: Supabase no está inicializado. Revisa tus variables de entorno.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const { data, error } = await client
        .from('messages') // Your table name
        .insert([
          {
            name,
            email,
            subject,
            message,
            // timestamp will default to NOW() in Supabase if not provided
            user_id: userId, // Store the user ID from Supabase Auth
          },
        ]);

      if (error) {
        console.error('Error al enviar el mensaje:', error.message);
        setStatus(`Error al enviar el mensaje: ${error.message}`);
      } else {
        setStatus('¡Mensaje enviado con éxito! Te responderemos pronto.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err: unknown) { // Type err as unknown
      console.error('Excepción al enviar el mensaje:', err);
      if (err instanceof Error) { // Check if err is an Error instance
        setStatus(`Error inesperado al enviar el mensaje: ${err.message}`);
      } else {
        setStatus(`Error inesperado al enviar el mensaje.`); // Generic error for non-Error objects
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Contáctanos</h1>

      <section className="mb-12">
        <p className="text-gray-700 leading-relaxed text-center mb-8">
          ¿Tienes alguna pregunta, comentario o sugerencia? ¡Nos encantaría escucharte!
          Completa el siguiente formulario o utiliza nuestra información de contacto.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Formulario de Contacto */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Envíanos un Mensaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="tu.correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Sobre qué trata tu consulta"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Tu Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Escribe tu mensaje aquí..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
              {status && (
                <p className={`text-center mt-4 ${status.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {status}
                </p>
              )}
            </form>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nuestra Información de Contacto</h2>
            <div className="space-y-6 text-gray-700 text-lg">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Email: <a href="mailto:belmargiuliana@gmail.com" className="text-pink-600 hover:underline">belmargiuliana@gmail.com</a></p>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p>Teléfono: <a href="tel:+5492946402814" className="text-pink-600 hover:underline">+54 9 2946402814</a></p>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Dirección: Choele Choel - Rio Negro</p>
              </div>
              <div className="flex items-center">
                <svg className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Horario: 24 HS</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {userId && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>ID de Usuario (para referencia): {userId}</p>
        </div>
      )}
    </div>
  );
}
