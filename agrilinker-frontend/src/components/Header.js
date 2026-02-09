import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import UserMenu from "./UserMenu";

function Header() {
  const { cart } = useContext(CartContext);
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-green-800 via-green-700 to-green-600 shadow-md flex items-center justify-between px-8 py-6">
      
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <span className="rounded-full bg-white p-2 shadow-md">
          <span className="text-green-700 text-2xl font-extrabold">A</span>
        </span>
        <Link to="/" className="text-white text-3xl font-extrabold tracking-wide drop-shadow-lg">
          AgriLinker
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex space-x-8">
        <Link to="/home" className="text-white text-lg font-semibold px-3 py-2 rounded hover:bg-green-900 hover:text-green-300 transition duration-150">
          Home
        </Link>
        <Link to="/marketplace" className="text-white text-lg font-semibold px-3 py-2 rounded hover:bg-green-900 hover:text-green-300 transition duration-150">
          Marketplace
        </Link>
        <Link to="/fertilizers" className="text-white text-lg font-semibold px-3 py-2 rounded hover:bg-green-900 hover:text-green-300 transition duration-150">
          Fertilizers
        </Link>
        <Link to="/support" className="text-white text-lg font-semibold px-3 py-2 rounded hover:bg-green-900 hover:text-green-300 transition duration-150">
          Support
        </Link>
      </nav>

      {/* Cart & Avatar */}
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="relative text-white text-3xl hover:text-green-300 hover:scale-110 transition">
          <FaShoppingCart />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Link>

        <UserMenu />
      </div>
    </header>
  );
}


export default Header;
