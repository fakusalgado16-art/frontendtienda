// src/app/order-confirmation/page.tsx
'use client';

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline'; // Icono de éxito

export default function OrderConfirmationPage() {
    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10 my-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center max-w-xl w-full">
                <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6 animate-bounce-in" />
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">¡Pedido Exitoso!</h1>
                <p className="text-lg text-gray-700 mb-6">
                    Tu pedido ha sido procesado correctamente. ¡Gracias por tu compra!
                </p>
                <p className="text-md text-gray-600 mb-8">
                    Cualquier duda, no dudes en comunicarte con nosotros:
                </p>
                <div className="space-y-3 mb-8">
                    <p className="text-xl font-semibold text-purple-700">
                        📞 <a href="tel:+5492946402814" className="hover:underline">+54 9 2946402814</a>
                    </p>
                    <p className="text-xl font-semibold text-purple-700">
                        📧 <a href="mailto:belmargiuliana@gmail.com" className="hover:underline">belmargiuliana@gmail.com</a>
                    </p>
                </div>
                <Link href="/products" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
                    Continuar Comprando
                </Link>
            </div>
        </div>
    );
}

