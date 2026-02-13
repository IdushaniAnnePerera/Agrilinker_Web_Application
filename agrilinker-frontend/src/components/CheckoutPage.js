import React, { useContext, useMemo, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import PremiumPaymentModal from "../components/PremiumPaymentModal";

const CheckoutPage = () => {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const totalAmount = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    );
  }, [cart]);

  // ✅ Normalize ID + TYPE for both Product & Fertilizer
  const normalizeCartItem = (item) => {
    const itemId = item.productId || item.fertilizerId || item.id || item._id;

    // Best: if your cart item already has item.type use it
    // Otherwise infer: fertilizers you add should set type: "FERTILIZER"
    const itemType =
      item.type ||
      item.itemType ||
      (item.fertilizerId || item.type === "fertilizer" ? "FERTILIZER" : "PRODUCT");

    return {
      itemId,
      itemType,
      name: item.name,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
      farmerEmail: item.farmerEmail || item.ownerEmail || item.sellerEmail || "",
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === "card") {
      setIsModalOpen(true);
    } else {
      processOrder("PENDING");
    }
  };

  const processOrder = async (payStatus) => {
    if (cart.length === 0) return;

    // ✅ validate ids
    const normalizedItems = cart.map(normalizeCartItem);
    const missing = normalizedItems.find((x) => !x.itemId);

    if (missing) {
      alert("Checkout error: Some cart items are missing an ID (product/fertilizer).");
      return;
    }

    setLoading(true);

    const orderData = {
      customer: { ...form },
      items: normalizedItems, // ✅ includes itemId + itemType
      totalAmount,
      paymentMethod,
      paymentStatus: payStatus,
      orderDate: new Date().toISOString(),
    };

    try {
      // ✅ Create order
      const res = await api.post("/api/orders", orderData);

      // ✅ Clear backend cart items (only if cartItemId exists)
      await Promise.all(
        cart
          .map((i) => i.cartItemId)
          .filter(Boolean)
          .map((id) => api.delete(`/cart/${id}`))
      );

      // ✅ Clear frontend cart
      clearCart();

      // ✅ Close modal + redirect
      setIsModalOpen(false);
      navigate("/order-confirmation", { state: { order: res.data || orderData } });
    } catch (error) {
      console.error(error);
      alert("Error: Could not place order. Check backend connection/logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-6">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center mr-3 text-sm">
                  1
                </span>
                Shipping Details
              </h2>

              <div className="grid grid-cols-1 gap-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none"
                />

                <input
                  type="text"
                  name="address"
                  placeholder="Shipping Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none"
                />

                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:border-green-500 focus:bg-white transition-all outline-none"
                />
              </div>

              <h2 className="text-xl font-bold mt-10 mb-6 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center mr-3 text-sm">
                  2
                </span>
                Payment Method
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === "cash"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl">💵</span>
                  <span className="font-bold text-gray-700">Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    paymentMethod === "card"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <span className="font-bold text-gray-700">Card</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0 || loading}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-[0.98]"
              >
                {loading ? "Processing..." : "Complete Order"}
              </button>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item, idx) => {
                  const key = item.cartItemId || item.productId || item.fertilizerId || item.id || item._id || idx;
                  const qty = item.quantity || 1;
                  const price = Number(item.price) || 0;

                  return (
                    <div key={key} className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {qty}</p>
                      </div>
                      <p className="font-bold text-gray-700">
                        Rs. {(price * qty).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-gray-200 mt-6 pt-6">
                <div className="flex justify-between text-2xl font-black text-green-900">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Premium Card Payment Modal */}
      <PremiumPaymentModal
        open={isModalOpen}
        totalAmount={totalAmount}
        loading={loading}
        onClose={() => setIsModalOpen(false)}
        onPay={() => processOrder("PAID")}
      />
    </div>
  );
};

export default CheckoutPage;
