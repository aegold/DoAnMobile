import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (dish) => {
    if (!dish || typeof dish !== "object" || !dish.id) {
      console.warn("addToCart: Invalid dish", dish);
      return;
    }

    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item && item.id === dish.id);
      if (existingDish) {
        return prevCart.map((item) =>
          item && item.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item && item.id === dishId
            ? { ...item, quantity: (item.quantity || 1) + change }
            : item
        )
        .filter((item) => item && item.quantity > 0)
    );
  };

  const removeFromCart = (dishId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item && item.id !== dishId)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      if (item && item.price && item.quantity) {
        return total + item.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        getTotalPrice,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
