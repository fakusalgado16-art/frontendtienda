// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Interfaz para un ítem individual en el carrito
interface CartItem {
    id: number; // El ID del producto
    nombre: string;
    precio: number;
    imagen_url: string;
    stock: number; // Stock disponible del producto
    quantity: number; // Cantidad de este producto en el carrito
    selectedColor?: { name: string; hex: string; }; // MODIFICADO: Color seleccionado, ahora un objeto { name, hex }
}

// Interfaz para el producto completo (como viene del backend/ProductCard)
// Necesitamos esta interfaz para que addToCart pueda acceder al array 'colors'
interface ProductForCart {
    id: number;
    nombre: string;
    precio: number;
    imagen_url: string;
    stock: number;
    colors?: { name: string; hex: string; }[]; // Debe tener la propiedad colors
}

// 2. Interfaz para el contexto del carrito (lo que el hook useCart va a retornar)
interface CartContextType {
    cartItems: CartItem[];
    // MODIFICADO: productToAdd ahora es ProductForCart, y selectedColorName es el nombre (string)
    addToCart: (productToAdd: ProductForCart, quantity: number, selectedColorName?: string) => void;
    // MODIFICADO: removeFromCart y updateQuantity también usan selectedColorName
    removeFromCart: (productId: number, selectedColorName?: string) => void;
    updateQuantity: (productId: number, selectedColorName: string | undefined, newQuantity: number) => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    clearCart: () => void; // Función para vaciar el carrito
}

// 3. Crear el contexto con un valor por defecto (importante para TypeScript)
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Componente Proveedor del Carrito
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Cargar el carrito desde localStorage al iniciar
    useEffect(() => {
        const storedCart = localStorage.getItem('miTiendaMaquillajeCart');
        if (storedCart) {
            try {
                const parsedCart: CartItem[] = JSON.parse(storedCart);
                // Normalizar selectedColor para compatibilidad con versiones anteriores
                const normalizedCart = parsedCart.map(item => {
                    if (typeof item.selectedColor === 'string') {
                        // Si selectedColor es una cadena (formato antiguo), conviértelo a objeto
                        // Asignamos un hex por defecto, ya que el antiguo string no lo contenía
                        return {
                            ...item,
                            selectedColor: { name: item.selectedColor, hex: '#CCCCCC' } // Puedes elegir un color por defecto diferente
                        };
                    }
                    return item;
                });
                setCartItems(normalizedCart);
            } catch (e) {
                console.error("Error al parsear el carrito desde localStorage", e);
                setCartItems([]);
            }
        }
    }, []);

    // Guardar el carrito en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem('miTiendaMaquillajeCart', JSON.stringify(cartItems));
    }, [cartItems]);

    // MODIFICADO: productToAdd es ProductForCart, selectedColorName es string
    const addToCart = useCallback((productToAdd: ProductForCart, quantity: number, selectedColorName?: string) => {
        if (quantity <= 0) return;

        // Encontrar el objeto de color completo si se seleccionó uno
        const fullSelectedColor = selectedColorName 
            ? productToAdd.colors?.find(c => c.name === selectedColorName) 
            : undefined;

        setCartItems((prevItems) => {
            // Para encontrar un ítem existente, ahora comparamos por ID y por el nombre del color
            const existingItemIndex = prevItems.findIndex(
                (item) => item.id === productToAdd.id && 
                          (item.selectedColor?.name === fullSelectedColor?.name || (!item.selectedColor && !fullSelectedColor))
            );

            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                const existingItem = updatedItems[existingItemIndex];
                const newTotalQuantity = existingItem.quantity + quantity;

                if (newTotalQuantity > productToAdd.stock) {
                    // Usar un modal o notificación en lugar de alert()
                    console.warn(`Solo hay ${productToAdd.stock} unidades disponibles de ${productToAdd.nombre}. No puedes añadir más.`);
                    return prevItems; // No modificar si excede el stock
                }

                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: newTotalQuantity,
                };
                return updatedItems;
            } else {
                // Si es un nuevo ítem, verificar stock
                if (quantity > productToAdd.stock) {
                    // Usar un modal o notificación en lugar de alert()
                    console.warn(`Solo hay ${productToAdd.stock} unidades disponibles de ${productToAdd.nombre}. No puedes añadir ${quantity}.`);
                    return prevItems;
                }
                return [
                    ...prevItems,
                    // Almacenamos el objeto de color completo en CartItem
                    { 
                        id: productToAdd.id,
                        nombre: productToAdd.nombre,
                        precio: productToAdd.precio,
                        imagen_url: productToAdd.imagen_url,
                        stock: productToAdd.stock,
                        quantity, 
                        selectedColor: fullSelectedColor // Almacenamos el objeto de color completo
                    }, 
                ];
            }
        });
    }, []);

    // MODIFICADO: removeFromCart también usa selectedColorName para identificar
    const removeFromCart = useCallback((productId: number, selectedColorName?: string) => {
        setCartItems((prevItems) =>
            prevItems.filter(
                (item) => !(item.id === productId && (item.selectedColor?.name === selectedColorName || (!item.selectedColor && !selectedColorName)))
            )
        );
    }, []);

    // MODIFICADO: updateQuantity también usa selectedColorName para identificar
    const updateQuantity = useCallback((productId: number, selectedColorName: string | undefined, newQuantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === productId && (item.selectedColor?.name === selectedColorName || (!item.selectedColor && !selectedColorName))) {
                    // Asegurarse de que la nueva cantidad no exceda el stock ni sea menor que 1
                    const updatedQuantity = Math.max(1, Math.min(newQuantity, item.stock));
                    return { ...item, quantity: updatedQuantity };
                }
                return item;
            })
        );
    }, []);

    const getTotalItems = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const getTotalPrice = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.precio * item.quantity, 0);
    }, [cartItems]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const contextValue = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

// 5. Hook personalizado para usar el carrito
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
