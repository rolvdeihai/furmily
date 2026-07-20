// context/CartContext.tsx
'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.payload.id);
      let updatedItems;
      if (existing) {
        updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload.id);
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);
      const totalItems = updatedItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: updatedItems, totalItems, totalPrice };
    }
    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };
    case 'LOAD_CART':
      const totalItems = action.payload.reduce((sum, i) => sum + i.quantity, 0);
      const totalPrice = action.payload.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: action.payload, totalItems, totalPrice };
    default:
      return state;
  }
}

const CART_STORAGE_KEY = 'furmily_cart';

// ---------- Context ----------
const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
} | null>(null);

// ---------- Provider ----------
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const items = JSON.parse(stored);
        dispatch({ type: 'LOAD_CART', payload: items });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// ---------- Hook ----------
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}