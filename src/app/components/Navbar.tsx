'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext'; // Importamos el contexto de autenticación de la tienda principal
import {
    UserCircleIcon, // Para Perfil
    ArrowRightOnRectangleIcon, // Para Iniciar Sesión / Cerrar Sesión
    UserPlusIcon, // Para Registrarse
    HomeIcon, // Para Inicio
    CubeTransparentIcon // Para Productos (ejemplo, puedes cambiarlo si tienes otro icono en mente)
} from '@heroicons/react/24/outline'; // Asegúrate de que este path sea correcto

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { getTotalItems } = useCart();
    const router = useRouter();
    const { user, logout, isLoading } = useAuth(); // Obtenemos el usuario, la función de logout y el estado de carga

    const totalItemsInCart = getTotalItems();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
            setIsMobileMenuOpen(false);
        } else {
            router.push('/products');
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <nav className="bg-[#9b0018] shadow-md p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo de la Tienda (IMAGEN) */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/Bravaletra.png" // Asegúrate de que esta ruta sea correcta para tu imagen de logo
                        alt="Brava Logo"
                        width={150}
                        height={50}
                        priority // Carga la imagen con alta prioridad
                    />
                </Link>

                {/* Enlaces de Navegación para Desktop */}
                <div className="hidden md:flex items-center space-x-8">
                    {/* AÑADIDO: Enlace a Inicio */}
                    <Link href="/" className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium">
                        Inicio
                    </Link>
                    <Link href="/products" className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium">
                        Productos
                    </Link>
                    <Link href="/categories" className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium">
                        Categorías
                    </Link>
                    <Link href="/contact" className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium">
                        Contacto
                    </Link>
                </div>

                {/* Iconos de Búsqueda, Usuario, Carrito (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Barra de Búsqueda Desktop */}
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="py-2 pl-10 pr-4 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 w-64 text-gray-700"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>

                    {/* Enlaces de Autenticación Condicionales para Desktop */}
                    {isLoading ? (
                        // Muestra un spinner o mensaje de carga mientras se verifica la sesión
                        <span className="text-gray-300">Cargando...</span>
                    ) : user ? (
                        // Si el usuario está logueado
                        <>
                            <Link href="/profile" className="text-white hover:text-pink-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800" title="Perfil">
                                <UserCircleIcon className="h-6 w-6" />
                            </Link>
                            <button onClick={logout} className="text-white hover:text-pink-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800" title="Cerrar Sesión">
                                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                            </button>
                        </>
                    ) : (
                        // Si el usuario NO está logueado
                        <>
                            <Link href="/login" className="text-white hover:text-pink-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800" title="Iniciar Sesión">
                                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                            </Link>
                            <Link href="/register" className="text-white hover:text-pink-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800" title="Registrarse">
                                <UserPlusIcon className="h-6 w-6" />
                            </Link>
                        </>
                    )}
                    
                    {/* Ícono del Carrito con Contador (Desktop) */}
                    <Link href="/cart" className="relative text-white hover:text-pink-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800" title="Carrito">
                        <ShoppingCartIcon className="h-6 w-6" />
                        {totalItemsInCart > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {totalItemsInCart}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Botón de Menú Móvil (Hamburguesa) y Iconos Móviles */}
                <div className="md:hidden flex items-center space-x-4">
                    {/* Ícono de Usuario Móvil (condicional) */}
                    {isLoading ? (
                        <span className="text-gray-300">...</span>
                    ) : user ? (
                        <Link href="/profile" className="text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300" title="Perfil">
                            <UserCircleIcon className="h-7 w-7" />
                        </Link>
                    ) : (
                        <Link href="/login" className="text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300" title="Iniciar Sesión">
                            <ArrowRightOnRectangleIcon className="h-7 w-7" />
                        </Link>
                    )}

                    {/* Ícono del Carrito con Contador (Móvil) */}
                    <Link href="/cart" className="relative text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300" title="Carrito">
                        <ShoppingCartIcon className="h-7 w-7" />
                        {totalItemsInCart > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {totalItemsInCart}
                            </span>
                        )}
                    </Link>

                    {/* Botón de Menú Hamburguesa */}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300">
                        {isMobileMenuOpen ? (
                            <XMarkIcon className="h-8 w-8" />
                        ) : (
                            <Bars3Icon className="h-8 w-8" />
                        )}
                    </button>
                </div>
            </div>

            {/* Menú Móvil Desplegable */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#9b0018] mt-4 py-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-4 px-4">
                        {/* AÑADIDO: Enlace a Inicio para Móvil */}
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                            Inicio
                        </Link>
                        <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                            Productos
                        </Link>
                        <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                            Categorías
                        </Link>
                        <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                            Nosotros
                        </Link>
                        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                            Contacto
                        </Link>
                        
                        {/* Enlaces de Autenticación Condicionales para Móvil */}
                        {isLoading ? (
                            <span className="text-gray-300">Cargando...</span>
                        ) : user ? (
                            <>
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                                    Perfil
                                </Link>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2 text-left">
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:text-pink-200 transition-colors duration-200 text-lg font-medium border-b border-gray-700 pb-2">
                                    Registrarse
                                </Link>
                            </>
                        )}

                        {/* Barra de Búsqueda Móvil */}
                        <form onSubmit={handleSearchSubmit} className="relative mt-4">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="py-2 pl-10 pr-4 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 w-full text-gray-700"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">
                                <MagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}
