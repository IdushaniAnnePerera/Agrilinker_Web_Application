import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  // ✅ Use ONLY the logged-in user from AuthContext
  const USER_ID = user?.id || user?.userId || user?.email || null;

  const loadCart = async () => {
    if (!USER_ID) {
      setCart([]); // ✅ not logged in -> empty cart
      return;
    }

    try {
      const res = await api.get(`/cart/${USER_ID}`);

      const data = Array.isArray(res.data) ? res.data : [];
      const normalized = data.map((x) => ({
        ...x,
        cartItemId: x.cartItemId || x.id || x._id,
      }));

      setCart(normalized);
    } catch (err) {
      console.error("Load cart error:", err);
      setCart([]);
    }
  };

  // ✅ reload cart when user changes (login/logout)
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [USER_ID]);

  const addToCart = async (item) => {
    if (!USER_ID) return;

    const itemId = item.id || item._id;

    const payload = {
      productId: item.productId || item.itemId || itemId, // supports normalized items too
      name: item.name,
      price: item.price,
      unit: item.unit || "unit",
      image:
        item.imageUrl ||
        (item.product_image ? `http://localhost:8081${item.product_image}` : "/images/placeholder.png"),
      farmerEmail: item.farmerEmail || item.ownerEmail || item.sellerEmail || "",
      quantity: 1,
    };

    try {
      await api.post(`/cart/${USER_ID}`, payload);
      await loadCart();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const increaseQty = async (cartItemId) => {
    if (!cartItemId) return;

    try {
      await api.put(`/cart/${cartItemId}?qty=1`);
      await loadCart();
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  const decreaseQty = async (cartItemId) => {
    if (!cartItemId) return;

    try {
      await api.put(`/cart/${cartItemId}?qty=-1`);
      await loadCart();
    } catch (err) {
      console.error("Update quantity error:", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!cartItemId) return;

    try {
      await api.delete(`/cart/${cartItemId}`);
      await loadCart();
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart, loadCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
