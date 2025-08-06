// src/app/cart/page.tsx
'use client';

import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'; // Iconos para eliminar y cambiar cantidad

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();

    // Calcula el subtotal total de todos los ítems en el carrito
    const totalSubtotal = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

    // Costo de envío simulado
    const shippingCost = totalSubtotal > 0 ? 10.00 : 0; // Ejemplo: costo de envío fijo si hay productos
    const total = totalSubtotal + shippingCost;

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10 my-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Tu Carrito de Compras</h1>

            {cartItems.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <p className="text-xl text-gray-700 mb-4">Tu carrito está vacío.</p>
                    <Link href="/products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                        Explorar productos
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Detalles de los Ítems del Carrito */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Productos en el Carrito</h2>
                        {cartItems.map((item) => (
                            // La key es importante para que React diferencie ítems del mismo producto pero diferente color
                            <div key={`${item.id}-${item.selectedColor?.name || ''}`} className="flex items-center py-4 border-b last:border-b-0">
                                <div className="flex-shrink-0 w-24 h-24 relative mr-4 rounded-md overflow-hidden border border-gray-200">
                                    <Image
                                        src={item.imagen_url || '/placeholder-product.png'}
                                        alt={item.nombre}
                                        fill={true}
                                        style={{ objectFit: 'contain' }}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="rounded-md"
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.nombre}</h3>
                                    {/* Muestra el color seleccionado si existe, incluyendo el circulito */}
                                    {item.selectedColor && (
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <span className="mr-2">Color: {item.selectedColor.name}</span>
                                            <span 
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: item.selectedColor.hex }}
                                                title={item.selectedColor.name}
                                            ></span>
                                        </div>
                                    )}
                                    <p className="text-lg font-bold text-purple-700 mt-1">${item.precio.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center mx-4">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.selectedColor?.name, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                        aria-label="Disminuir cantidad"
                                    >
                                        <MinusIcon className="h-5 w-5" />
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const newQuantity = parseInt(e.target.value);
                                            if (!isNaN(newQuantity) && newQuantity >= 1 && newQuantity <= item.stock) {
                                                updateQuantity(item.id, item.selectedColor?.name, newQuantity);
                                            } else if (newQuantity < 1) {
                                                updateQuantity(item.id, item.selectedColor?.name, 1);
                                            } else if (newQuantity > item.stock) {
                                                updateQuantity(item.id, item.selectedColor?.name, item.stock);
                                            }
                                        }}
                                        className="w-16 mx-2 text-center border border-gray-300 rounded-md py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                        min="1"
                                        max={item.stock}
                                        aria-label={`Cantidad de ${item.nombre}`}
                                    />
                                    <button
                                        onClick={() => updateQuantity(item.id, item.selectedColor?.name, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="p-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                        aria-label="Aumentar cantidad"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex flex-col items-end ml-auto">
                                    <p className="text-xl font-bold text-gray-900 mb-2">
                                        ${(item.precio * item.quantity).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => removeFromCart(item.id, item.selectedColor?.name)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                                        aria-label="Eliminar producto del carrito"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Columna Derecha: Resumen del Carrito */}
                    <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-24">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Resumen del Pedido</h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex justify-between items-center text-lg">
                                <span>Subtotal ({cartItems.length} ítems):</span>
                                <span className="font-semibold">${totalSubtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span>Costo de Envío:</span>
                                <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-2xl font-extrabold text-gray-900 border-t pt-4 mt-4">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        {/* Botón "Finalizar Compra" en el resumen */}
                        <Link
                            href="/checkout"
                            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-md text-lg mt-8 hover:bg-purple-700 transition-colors duration-300 shadow-lg transform hover:scale-105 text-center block"
                        >
                            Finalizar Compra
                        </Link>
                        <Link href="/products" className="block text-center text-purple-600 hover:underline mt-4 text-sm font-medium">
                            Continuar comprando
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
