import { useState, useEffect, useCallback } from "react";

const CART_KEY = "smart_lowcost_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch { return []; }
}

// Ghi thẳng vào localStorage đồng bộ (dùng cho addItem + navigate ngay lập tức)
function saveCartSync(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export default function useCart() {
  const [items, setItems] = useState(getCart);

  useEffect(() => {
    saveCartSync(items);
  }, [items]);

  const addItem = useCallback((product, qty = 1) => {
    const current = getCart(); // đọc thẳng từ localStorage để luôn mới nhất
    const existing = current.find(i => i.id === product.id);
    let updated;
    if (existing) {
      updated = current.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
    } else {
      updated = [...current, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.images?.[0] || "",
      }];
    }
    saveCartSync(updated);   // ghi ngay, đồng bộ
    setItems(updated);        // cập nhật React state
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems(prev => {
      const updated = qty <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, quantity: qty } : i);
      saveCartSync(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      saveCartSync(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    saveCartSync([]);
    setItems([]);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, addItem, updateQty, removeItem, clearCart, total, count };
}
