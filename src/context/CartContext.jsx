import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "perfumo_cart";

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error(
        "Грешка при зареждане на количката:",
        error
      );

      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Грешка при запазване на количката:",
        error
      );
    }
  }, [cartItems]);

  /*
   * Връща колко ml от конкретен продукт вече са
   * използвани в количката.
   *
   * Пример:
   * 10 ml x 1 + 5 ml x 1 = 15 ml
   */
  const getProductCartMl = (items, productId) => {
    return items
      .filter(
        (item) =>
          item.productId?.toString() ===
          productId?.toString()
      )
      .reduce(
        (total, item) =>
          total + Number(item.size) * Number(item.quantity),
        0
      );
  };

  /*
   * Добавяне на продукт.
   *
   * Проверяваме общото количество ml за продукта,
   * а не само конкретния размер.
   */
  const addToCart = (product, size, quantity = 1) => {
    const priceMap = {
      3: product.price3ml,
      5: product.price5ml,
      10: product.price10ml,
      20: product.price20ml,
    };

    const price = Number(priceMap[size] || 0);
    const selectedSize = Number(size);
    const selectedQuantity = Number(quantity);
    const availableMl = Number(product.availableMl || 0);

    if (
      !product?._id ||
      !price ||
      price <= 0 ||
      ![3, 5, 10, 20].includes(selectedSize) ||
      !Number.isInteger(selectedQuantity) ||
      selectedQuantity < 1
    ) {
      return;
    }

    const requiredMl =
      selectedSize * selectedQuantity;

    setCartItems((currentItems) => {
      const alreadyInCartMl = getProductCartMl(
        currentItems,
        product._id
      );

      const remainingMl =
        availableMl - alreadyInCartMl;

      /*
       * Няма достатъчно ml за добавянето.
       */
      if (requiredMl > remainingMl) {
        console.warn(
          `Няма достатъчно наличност за ${product.name}. ` +
            `Налични за добавяне: ${remainingMl} ml.`
        );

        return currentItems;
      }

      const cartItemId =
        `${product._id}-${selectedSize}`;

      const existingItem = currentItems.find(
        (item) =>
          item.cartItemId === cartItemId
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity:
                  item.quantity + selectedQuantity,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          cartItemId,
          productId: product._id,
          name: product.name,
          brand: product.brand,
          image: product.image || "",
          size: selectedSize,
          price,
          quantity: selectedQuantity,

          /*
           * Запазваме наличността на продукта,
           * за да можем да я проверяваме и в количката.
           */
          availableMl,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );
  };

  /*
   * Промяна на количество от количката.
   */
  const updateQuantity = (cartItemId, quantity) => {
    const newQuantity = Number(quantity);

    if (newQuantity <= 0) {
      setCartItems((currentItems) =>
        currentItems.filter(
          (item) => item.cartItemId !== cartItemId
        )
      );

      return;
    }

    if (!Number.isInteger(newQuantity)) {
      return;
    }

    setCartItems((currentItems) => {
      const targetItem = currentItems.find(
        (item) =>
          item.cartItemId === cartItemId
      );

      if (!targetItem) {
        return currentItems;
      }

      const availableMl = Number(
        targetItem.availableMl || 0
      );

      /*
       * Колко ml от същия продукт има в
       * останалите артикули в количката.
       */
      const otherItemsMl = currentItems
        .filter(
          (item) =>
            item.productId?.toString() ===
            targetItem.productId?.toString()
        )
        .filter(
          (item) =>
            item.cartItemId !==
            targetItem.cartItemId
        )
        .reduce(
          (total, item) =>
            total +
            Number(item.size) *
              Number(item.quantity),
          0
        );

      const requiredMl =
        Number(targetItem.size) * newQuantity;

      if (
        otherItemsMl + requiredMl >
        availableMl
      ) {
        return currentItems;
      }

      return currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      );
    });
  };

  /*
   * Увеличаване с +1.
   */
  const increaseQuantity = (cartItemId) => {
    setCartItems((currentItems) => {
      const targetItem = currentItems.find(
        (item) =>
          item.cartItemId === cartItemId
      );

      if (!targetItem) {
        return currentItems;
      }

      const availableMl = Number(
        targetItem.availableMl || 0
      );

      const productId =
        targetItem.productId?.toString();

      const currentProductMl = currentItems
        .filter(
          (item) =>
            item.productId?.toString() ===
            productId
        )
        .reduce(
          (total, item) =>
            total +
            Number(item.size) *
              Number(item.quantity),
          0
        );

      const additionalMl =
        Number(targetItem.size);

      /*
       * Ако добавянето на още една бройка
       * надхвърля наличните ml — не правим нищо.
       */
      if (
        currentProductMl + additionalMl >
        availableMl
      ) {
        return currentItems;
      }

      return currentItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    });
  };

  const decreaseQuantity = (cartItemId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          item.quantity,
      0
    );
  }, [cartItems]);

  const cartIsEmpty =
    cartItems.length === 0;

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    cartIsEmpty,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart трябва да се използва вътре в CartProvider."
    );
  }

  return context;
}

export {
  CartProvider,
  useCart,
};