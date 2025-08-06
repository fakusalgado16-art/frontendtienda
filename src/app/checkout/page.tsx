'use client';

import { useCart } from '../context/CartContext'; // Corregida la ruta a contexts/CartContext
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image'; // Asegúrate de importar Image para el resumen del pedido
import Swal from 'sweetalert2'; // Importar SweetAlert2 para notificaciones

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        email: '',
        phone: '', // NUEVO: Campo para el número de teléfono
        locationInstructions: '', // NUEVO: Campo para indicaciones de ubicación
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [showError, setShowError] = useState(false);
    const [loadingCheckout, setLoadingCheckout] = useState(false); // Para mostrar estado de carga al finalizar compra
    const [checkoutError, setCheckoutError] = useState<string | null>(null); // Para errores del checkout
    const [isRedirectingToConfirmation, setIsRedirectingToConfirmation] = useState(false); // NUEVO ESTADO

    // Datos de la transferencia bancaria
    const CVU = '0000003100044301698728'; // Reemplaza con tu CVU real
    const ALIAS = 'giuli.belmar.uno'; // Reemplaza con tu alias real
    const WHATSAPP_NUMBER = '+5492946402814'; // Número de WhatsApp para comprobantes
    const CONTACT_EMAIL = 'belmargiuliana@gmail.com'; // Email de contacto
    const MERCADO_PAGO_ACCOUNT_NAME = 'Giuliana Belen Belmar'; // Nombre del titular de la cuenta de Mercado Pago

    useEffect(() => {
        // Redirigir si el carrito está vacío Y NO estamos ya redirigiendo a la confirmación
        if (cartItems.length === 0 && !isRedirectingToConfirmation) {
            router.replace('/cart'); // Usar replace para que no se pueda volver con el botón de atrás
        }
    }, [cartItems, router, isRedirectingToConfirmation]); // Añadido isRedirectingToConfirmation a las dependencias

    useEffect(() => {
        // Validar el formulario
        const { fullName, address, city, postalCode, country, email, phone } = shippingInfo; // Añadido 'phone'
        const isValid = fullName.trim() !== '' &&
                        address.trim() !== '' &&
                        city.trim() !== '' &&
                        postalCode.trim() !== '' &&
                        country.trim() !== '' &&
                        email.trim() !== '' &&
                        email.includes('@') &&
                        phone.trim() !== ''; // Teléfono ahora es obligatorio
        setIsFormValid(isValid);
        setShowError(false); // Reiniciar error al cambiar el formulario
        setCheckoutError(null); // Limpiar errores de checkout al cambiar el formulario
    }, [shippingInfo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Añadido HTMLTextAreaElement
        const { name, value } = e.target;
        setShippingInfo(prevInfo => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.precio * item.quantity, 0);
    };

    const subtotal = calculateSubtotal();
    const shippingCost = subtotal > 0 ? 10.00 : 0; // Ejemplo: costo de envío fijo si hay productos
    const total = subtotal + shippingCost;

    const copyToClipboard = (text: string, label: string) => {
        // Usar document.execCommand('copy') por compatibilidad en entornos de iframe
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            Swal.fire({
                icon: 'success',
                title: '¡Copiado!',
                text: `${label} copiado al portapapeles.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            Swal.fire({
                icon: 'error',
                title: 'Error al copiar',
                text: 'Por favor, copia manualmente.',
                confirmButtonText: 'Ok'
            });
        }
        document.body.removeChild(textarea);
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) {
            setShowError(true);
            return;
        }

        setLoadingCheckout(true); // Activar estado de carga
        setCheckoutError(null); // Limpiar cualquier error previo

        try {
            const orderData = {
                shippingInfo: { // Envía toda la información de envío, incluyendo los nuevos campos
                    fullName: shippingInfo.fullName,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    postalCode: shippingInfo.postalCode,
                    country: shippingInfo.country,
                    email: shippingInfo.email,
                    phone: shippingInfo.phone, // Incluye el teléfono
                    locationInstructions: shippingInfo.locationInstructions, // Incluye las indicaciones
                },
                cartItems: cartItems.map(item => ({
                    productId: item.id,
                    productName: item.nombre,
                    quantity: item.quantity,
                    priceAtPurchase: item.precio,
                    selectedColor: item.selectedColor, // Ya es un objeto {name, hex} gracias a CartContext
                })),
                totalAmount: total,
                // Puedes añadir el método de pago para registro en la DB si lo necesitas
                paymentMethod: 'Transferencia Bancaria (Mercado Pago)', 
            };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                setIsRedirectingToConfirmation(true); // Establecer el estado de redirección
                clearCart(); // Vaciar el carrito
                router.push('/order-confirmation'); // Redirigir a la página de confirmación
            } else {
                const errorData = await response.json();
                setCheckoutError(errorData.message || 'Error al procesar el pedido. Inténtalo de nuevo.');
                console.error('Error al procesar el pedido:', errorData);
            }
        } catch (error: any) { // Añadido ': any' para tipar el error
            setCheckoutError(`No se pudo conectar con el servidor. Por favor, verifica tu conexión. Detalles: ${error.message || 'Error desconocido'}`);
            console.error('Error de red al procesar el pedido:', error);
        } finally {
            setLoadingCheckout(false); // Desactivar estado de carga
        }
    };

    // Mostrar un mensaje de carga o redirigir si el carrito está vacío al renderizar
    if (cartItems.length === 0 && !isRedirectingToConfirmation) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-700">
                Redirigiendo al carrito...
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10 min-h-[calc(100vh-80px)] flex flex-col md:flex-row gap-8 mt-20">
            {/* Sección de Información de Envío y Pago */}
            <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Información de Envío</h2>
                <form onSubmit={handleCheckout}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={shippingInfo.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Número de Teléfono</label>
                            <input
                                type="tel" // Usar type="tel" para teléfonos
                                id="phone"
                                name="phone"
                                value={shippingInfo.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={shippingInfo.postalCode}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={shippingInfo.country}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                required
                            />
                        </div>
                        <div className="md:col-span-2"> {/* Ocupa ambas columnas */}
                            <label htmlFor="locationInstructions" className="block text-sm font-medium text-gray-700 mb-1">Indicaciones de Ubicación (Opcional)</label>
                            <textarea
                                id="locationInstructions"
                                name="locationInstructions"
                                value={shippingInfo.locationInstructions}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Ej: Casa con portón rojo, al lado de una panadería..."
                            ></textarea>
                        </div>
                    </div>

                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Método de Pago: Transferencia Bancaria (Mercado Pago)</h2>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-6">
                        <p className="text-gray-800 font-semibold mb-3">Realiza la transferencia a los siguientes datos:</p>
                        <p className="text-gray-700 text-sm mb-2">
                            Cuenta de Mercado Pago a nombre de: <span className="font-bold">{MERCADO_PAGO_ACCOUNT_NAME}</span>
                        </p>
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700">CVU:</label>
                            <div className="flex items-center">
                                <span className="font-mono text-gray-900 bg-gray-100 p-2 rounded-md flex-grow">{CVU}</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(CVU, 'CVU')}
                                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md transition-colors"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Alias:</label>
                            <div className="flex items-center">
                                <span className="font-mono text-gray-900 bg-gray-100 p-2 rounded-md flex-grow">{ALIAS}</span>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(ALIAS, 'Alias')}
                                    className="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md transition-colors"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                        <p className="text-purple-700 font-semibold text-base mb-2">
                            ¡Importante! El pedido se comenzará a preparar una vez que se reciba y verifique el pago.
                        </p>
                        <p className="text-gray-700 text-sm">
                            Una vez realizada la transferencia, por favor, envía el comprobante de pago a nuestro WhatsApp:
                            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, '').replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-bold ml-1">
                                {WHATSAPP_NUMBER}
                            </a>
                        </p>
                        <p className="text-gray-700 text-sm mt-1">
                            Para cualquier consulta, puedes comunicarte a ese número o al email:
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-purple-600 hover:underline font-bold ml-1">
                                {CONTACT_EMAIL}
                            </a>
                        </p>
                    </div>
                    
                    {showError && !isFormValid && (
                        <p className="text-red-600 text-sm mt-4">
                            Por favor, completa todos los campos de información de envío (incluyendo el teléfono) y asegúrate de que el email sea válido.
                        </p>
                    )}

                    {checkoutError && (
                        <p className="text-red-600 text-sm mt-4">
                            {checkoutError}
                        </p>
                    )}

                    <button
                        type="submit"
                        className={`mt-8 w-full py-3 px-6 rounded-md text-white text-lg font-semibold transition-colors duration-300
                                    ${isFormValid && !loadingCheckout ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!isFormValid || loadingCheckout} // Deshabilitar durante la carga
                    >
                        {loadingCheckout ? 'Procesando...' : 'Finalizar Compra (Enviar Comprobante luego)'}
                    </button>
                </form>
            </div>

            {/* Sección de Resumen del Pedido */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg self-start sticky top-24">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Resumen del Pedido</h2>
                <div className="space-y-4">
                    {cartItems.length === 0 ? (
                        <p className="text-gray-600">Tu carrito está vacío.</p>
                    ) : (
                        cartItems.map((item) => (
                            <div key={`${item.id}-${item.selectedColor?.name || 'no-color'}`} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <div className="flex items-center">
                                    <Image src={item.imagen_url} alt={item.nombre} width={50} height={50} className="rounded-md mr-3 object-cover" />
                                    <div>
                                        <p className="text-gray-800 font-medium">{item.nombre}</p>
                                        <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                        {item.selectedColor && (
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <span className="mr-1">Color: {item.selectedColor.name}</span>
                                                <span 
                                                    className="w-3 h-3 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: item.selectedColor.hex }}
                                                    title={item.selectedColor.name}
                                                ></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-800 font-semibold">${(item.precio * item.quantity).toFixed(2)}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Envío:</span>
                        <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-300 mt-4">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
