'use client';
import { useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
export function ClearCart() { const { clear } = useCart(); useEffect(() => { clear(); }, []); return null; } // eslint-disable-line react-hooks/exhaustive-deps
