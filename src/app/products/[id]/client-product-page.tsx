// src/app/products/[id]/client-product-page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TruckIcon, CreditCardIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Importar iconos de flecha
import ProductCard from '@/app/components/ProductCard';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext'; // Corregida la ruta a contexts/CartContext

// Definición de la interfaz Product con 'imagen_url' (singular)
interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number; // Asegúrate de que esta propiedad exista
    id_categoria: number;
    marca: string;
    imagen_url: string; // ¡CAMBIADO A SINGULAR!
    activo: boolean;
    fecha_creacion: string;
    ultima_actualizacion: string;
    colors?: { name: string; hex: string; }[]; 
}

interface ClientProductPageProps {
    initialProduct: Product;
}

export default function ClientProductPage({ initialProduct }: ClientProductPageProps) {
    const [product, setProduct] = useState<Product>(initialProduct);
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
    const [zipCode, setZipCode] = useState<string>('');
    const [currentMainImage, setCurrentMainImage] = useState<string>(
        initialProduct.imagen_url || '/placeholder-product.png'
    );
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showShippingMessage, setShowShippingMessage] = useState(false);
    const [shippingMessage, setShippingMessage] = useState<string>('');

    const { addToCart } = useCart();

    const FREE_SHIPPING_THRESHOLD = 60000;
    const PAYMENT_OPTIONS_LINK = '#';
    const INSTAGRAM_URL = 'https://www.instagram.com/tu_usuario_de_instagram';
    const FACEBOOK_URL = 'https://www.facebook.com/tu_pagina_de_facebook';

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

    const carouselRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [activeDotIndex, setActiveDotIndex] = useState(0);
    const [totalDots, setTotalDots] = useState(0);

    useEffect(() => {
        setProduct(initialProduct);
        setCurrentMainImage(
            initialProduct.imagen_url || '/placeholder-product.png'
        );
        // Establece el primer color como seleccionado por defecto si hay colores
        if (initialProduct.colors && initialProduct.colors.length > 0) {
            setSelectedColor(initialProduct.colors[0].name);
        } else {
            setSelectedColor(undefined); // No hay colores, no hay color seleccionado
        }
        console.log("ClientProductPage: Product updated. Current main image:", initialProduct.imagen_url);
    }, [initialProduct]);

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            if (!BASE_URL) {
                console.error('NEXT_PUBLIC_BACKEND_BASE_URL is not defined.');
                return;
            }
            try {
                const response = await fetch(`${BASE_URL}/api/products`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products for similar items.');
                }
                const allProducts: Product[] = await response.json();
                
                // Filter out the current product
                const filteredProducts = allProducts.filter(p => p.id !== initialProduct.id);

                // Shuffle the filtered products and take the first 5
                const shuffledProducts = filteredProducts.sort(() => 0.5 - Math.random());
                setSimilarProducts(shuffledProducts.slice(0, 5)); // Show up to 5 random similar products
            } catch (error) {
                console.error('Error fetching similar products:', error);
                setSimilarProducts([]); 
            }
        };

        fetchSimilarProducts();
    }, [BASE_URL, initialProduct]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (!carousel) return;

        const handleMouseDown = (e: MouseEvent) => {
            setIsDragging(true);
            setStartX(e.pageX - carousel.offsetLeft);
            setScrollLeft(carousel.scrollLeft);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            const walk = (x - startX) * 1.5;
            carousel.scrollLeft = scrollLeft - walk;
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleMouseLeave = () => {
            setIsDragging(false);
        };

        const handleTouchStart = (e: TouchEvent) => {
            setIsDragging(true);
            setStartX(e.touches[0].pageX - carousel.offsetLeft);
            setScrollLeft(carousel.scrollLeft);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.touches[0].pageX - carousel.offsetLeft;
            const walk = (x - startX) * 1.5;
            carousel.scrollLeft = scrollLeft - walk;
        };

        const handleTouchEnd = () => {
            setIsDragging(false);
        };

        const updateScrollState = () => {
            if (!carousel) return;
            setCanScrollLeft(carousel.scrollLeft > 0);
            setCanScrollRight(carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth);

            const itemWidth = carousel.querySelector('.flex-shrink-0')?.clientWidth || 0;
            const gap = 24;
            const scrollPerItem = itemWidth + gap;
            const newActiveDotIndex = Math.round(carousel.scrollLeft / scrollPerItem);
            setActiveDotIndex(newActiveDotIndex);

            if (itemWidth > 0) {
                setTotalDots(Math.ceil(carousel.scrollWidth / scrollPerItem));
            }
        };

        carousel.addEventListener('mousedown', handleMouseDown);
        carousel.addEventListener('mousemove', handleMouseMove);
        carousel.addEventListener('mouseup', handleMouseUp);
        carousel.addEventListener('mouseleave', handleMouseLeave);
        
        carousel.addEventListener('touchstart', handleTouchStart);
        carousel.addEventListener('touchmove', handleTouchMove);
        carousel.addEventListener('touchend', handleTouchEnd);

        carousel.addEventListener('scroll', updateScrollState);
        const resizeObserver = new ResizeObserver(updateScrollState);
        resizeObserver.observe(carousel);

        updateScrollState();

        return () => {
            carousel.removeEventListener('mousedown', handleMouseDown);
            carousel.removeEventListener('mousemove', handleMouseMove);
            carousel.removeEventListener('mouseup', handleMouseUp);
            carousel.removeEventListener('mouseleave', handleMouseLeave);

            carousel.removeEventListener('touchstart', handleTouchStart);
            carousel.removeEventListener('touchmove', handleTouchMove);
            carousel.removeEventListener('touchend', handleTouchEnd);

            carousel.removeEventListener('scroll', updateScrollState);
            resizeObserver.disconnect();
        };
    }, [isDragging, startX, scrollLeft, similarProducts]);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const itemWidth = carouselRef.current.querySelector('.flex-shrink-0')?.clientWidth || 0;
            const gap = 24;
            const scrollAmount = (itemWidth + gap) * 1;
            
            carouselRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const scrollToDot = (index: number) => {
        if (carouselRef.current) {
            const itemWidth = carouselRef.current.querySelector('.flex-shrink-0')?.clientWidth || 0;
            const gap = 24;
            const scrollAmount = (itemWidth + gap) * index;
            carouselRef.current.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showConfirmation) {
            timer = setTimeout(() => {
                setShowConfirmation(false);
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showConfirmation]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showShippingMessage) {
            timer = setTimeout(() => {
                setShowShippingMessage(false);
                setShippingMessage('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [showShippingMessage]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && product) {
            if (value <= product.stock) {
                setQuantity(value);
            } else {
                setQuantity(product.stock);
            }
        } else if (value <= 0) {
            setQuantity(1);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (product.stock === 0) { // No permitir añadir si no hay stock
            console.warn('Este producto está agotado.');
            return;
        }

        // Si el producto tiene colores y no se ha seleccionado ninguno, no permitir añadir
        if (product.colors && product.colors.length > 0 && !selectedColor) {
            console.warn('Por favor, selecciona un color.');
            return;
        }

        addToCart(product, quantity, selectedColor);

        setShowConfirmation(true);
    };

    const handleCalculateShipping = () => {
        if (zipCode.trim() === '') {
            setShippingMessage('Por favor, ingresa un código postal.');
            setShowShippingMessage(true);
            return;
        }
        setShippingMessage(`Calculando envío para el código postal: ${zipCode}. (Funcionalidad pendiente)`);
        setShowShippingMessage(true);
    };

    const mainProductImage = product.imagen_url;

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10 my-8">
            {showConfirmation && (
                <div className="fixed top-20 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    Producto añadido al carrito!
                </div>
            )}

            {showShippingMessage && (
                <div className="fixed top-20 right-5 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-down">
                    {shippingMessage}
                </div>
            )}

            <nav className="text-sm text-gray-500 mb-4" aria-label="breadcrumb">
                <ol className="list-none p-0 inline-flex">
                    <li className="flex items-center">
                        <Link href="/" className="text-gray-600 hover:text-purple-700">Inicio</Link>
                        <span className="mx-2 text-gray-400">/</span>
                    </li>
                    <li className="flex items-center">
                        <Link href="/products" className="text-gray-600 hover:text-purple-700">Productos</Link>
                        <span className="mx-2 text-gray-400">/</span>
                    </li>
                    <li className="flex items-center">
                        <span className="text-purple-700 font-semibold">{product.nombre}</span>
                    </li>
                </ol>
            </nav>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-start p-6 lg:p-8">
                <div className="w-full md:w-1/2 flex flex-col items-center mb-6 md:mb-0 md:mr-8">
                    <div className="relative w-full flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden" style={{ minHeight: '400px', maxHeight: '550px' }}>
                        {!mainProductImage && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                No hay imagen disponible para este producto.
                            </div>
                        )}
                        <Image
                            src={currentMainImage}
                            alt={product.nombre}
                            fill={true}
                            style={{ objectFit: 'contain' }}
                            priority
                            className="rounded-lg"
                            onError={(e) => {
                                console.error("Error loading main image:", e.currentTarget.src);
                                e.currentTarget.src = '/placeholder-product.png';
                            }}
                        />
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col justify-between text-center md:text-left pt-1">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                            {product.nombre}
                        </h1>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-4 text-gray-600">
                                <p className="text-base">
                                    Marca: <span className="font-semibold text-gray-800">{product.marca || 'Sin Marca'}</span>
                                </p>
                                {/* NUEVO: Solo muestra "Agotado" si el stock es 0 */}
                                {product.stock === 0 && (
                                    <p className="text-base font-semibold text-red-600">Agotado</p>
                                )}
                        </div>

                        <p className="text-4xl font-extrabold text-purple-700 mb-5">
                            ${product.precio.toFixed(2)}
                        </p>

                        <div className="mb-5">
                            <div className="flex items-center text-gray-700 mb-1">
                                <CreditCardIcon className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="font-semibold text-sm">Medios de Pago:</span>
                            </div>
                            <Link href={PAYMENT_OPTIONS_LINK} className="text-purple-600 hover:underline text-xs font-medium">
                                Ver medios de pago
                            </Link>
                        </div>

                        <div className="mb-5">
                            <div className="flex items-center text-gray-700 mb-1">
                                <TruckIcon className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="font-semibold text-sm">Envío:</span>
                            </div>
                            <p className="text-sm text-gray-600">
                                Envío gratis superando los ${FREE_SHIPPING_THRESHOLD.toLocaleString('es-AR')}
                            </p>
                        </div>

                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-5">
                                <label htmlFor="color-select" className="block text-sm font-medium text-gray-700 mb-1 text-base">
                                    Color: <span className="font-semibold text-gray-900">{selectedColor || 'Seleccionar'}</span>
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {product.colors.map((colorOption, index) => (
                                        <div key={index} className="relative group">
                                            <button
                                                onClick={() => setSelectedColor(colorOption.name)}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 
                                                            ${selectedColor === colorOption.name ? 'border-4 border-gray-800' : 'border-2 border-gray-300 hover:border-gray-400'}`}
                                                style={{ backgroundColor: colorOption.hex }}
                                                aria-label={`Seleccionar color ${colorOption.name}`}
                                                title={colorOption.name}
                                                disabled={product.stock === 0} // Deshabilita la selección de color si no hay stock
                                            >
                                                {selectedColor === colorOption.name && (
                                                    <span className="w-3 h-3 bg-white rounded-full border border-gray-400"></span>
                                                )}
                                            </button>
                                            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                                {colorOption.name} ({colorOption.hex})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                        <div className="flex items-center space-x-1">
                            <label htmlFor="quantity" className="text-gray-700 font-medium text-base">Cantidad:</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                max={product.stock}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-20 p-1 border border-gray-300 rounded-md text-center text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
                                disabled={product.stock === 0} // Deshabilita el input de cantidad si no hay stock
                            />
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="w-full sm:w-auto bg-purple-600 text-white font-bold py-2 px-6 rounded-full text-base hover:bg-purple-700 transition-colors duration-300 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={product.stock === 0 || (product.colors && product.colors.length > 0 && !selectedColor)} // Deshabilita si no hay stock O si tiene colores y no se ha seleccionado uno
                        >
                            {product.stock > 0 ? (product.colors && product.colors.length > 0 && !selectedColor ? 'Selecciona un Color' : 'Añadir al Carrito') : 'Agotado'}
                        </button>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Calcular Envío</h3>
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Código Postal"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                className="w-32 py-2 px-3 border border-gray-300 rounded-md text-center text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                            />
                            <button
                                onClick={handleCalculateShipping}
                                className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50 text-sm"
                            >
                                CALCULAR
                            </button>
                        </div>
                        <Link href="#" className="text-purple-600 hover:underline text-xs mt-1 block">
                            No sé mi código postal
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">Descripción del Producto</h2>
                <p className="text-gray-700 text-base leading-relaxed">
                    {product.descripcion}
                </p>
            </div>

            {similarProducts.length > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Productos Similares</h2>
                    <div className="relative">
                        <div
                            ref={carouselRef}
                            className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
                        >
                            {similarProducts.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex-shrink-0 w-64 md:w-72 lg:w-80"
                                >
                                    <ProductCard
                                        id={p.id}
                                        nombre={p.nombre}
                                        precio={p.precio}
                                        imagen_url={p.imagen_url || '/placeholder-product.png'}
                                        marca={p.marca}
                                        stock={p.stock} // ¡PASAMOS LA PROPIEDAD STOCK!
                                        colors={p.colors} // Pass colors to similar products
                                    />
                                </div>
                            ))}
                        </div>

                        {canScrollLeft && (
                            <button
                                onClick={() => scrollCarousel('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                aria-label="Scroll left"
                            >
                                <ChevronLeftIcon className="h-6 w-6 text-purple-600" />
                            </button>
                        )}
                        {canScrollRight && (
                            <button
                                onClick={() => scrollCarousel('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300"
                                aria-label="Scroll right"
                            >
                                <ChevronRightIcon className="h-6 w-6 text-purple-600" />
                            </button>
                        )}
                    </div>

                    {totalDots > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            {Array.from({ length: totalDots }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToDot(index)}
                                    className={`h-2 w-2 rounded-full transition-colors duration-300 ${activeDotIndex === index ? 'bg-purple-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 bg-gray-900 text-white rounded-lg shadow-lg p-6 lg:p-8 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-bold mb-4">¡Síguenos en nuestras redes!</h2>
                <div className="flex space-x-6">
                    <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-purple-400 transition-colors duration-300"
                        aria-label="Visitar nuestro Instagram"
                    >
                        <FaInstagram size={40} />
                    </a>
                    <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-purple-400 transition-colors duration-300"
                        aria-label="Visitar nuestro Facebook"
                    >
                        <FaFacebookF size={40} />
                    </a>
                </div>
            </div>
        </div>
    );
}
