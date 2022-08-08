import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const prevCartRef = useRef<Product[]>()

  useEffect(() => {
    prevCartRef.current = cart
  })

  const cartPreviousValue = prevCartRef.current ?? cart // 1a vez é undefined

  useEffect(() => {
    if (cartPreviousValue !== cart) {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }
  }, [, cartPreviousValue, cart])

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]
      const productInCart = updatedCart.find(product => product.id === productId) 
      const currentAmount = productInCart ? productInCart.amount : 0
      
      const response = await api.get(`/stock/${productId}`)
      const updatedAmount = currentAmount + 1
      if (response.data.amount >= updatedAmount) {
        if (productInCart) {
          productInCart.amount = updatedAmount
        }
        else {
          const product = await api.get(`/products/${productId}`)

          const newProduct = {
            ...product.data,
            amount: 1
          }

          updatedCart.push(newProduct)
        }

        setCart(updatedCart)
      }
      else {
        toast.error('Quantidade solicitada fora de estoque');
      }
    } 
    catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.filter(product => product.id !== productId)
      
      if (updatedCart.length !== cart.length) {
        setCart(updatedCart)
      }
      else {
        throw Error()
      }
    } 
    catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {
      if (amount > 0 ) {
        try {
          const response = await api.get(`/stock/${productId}`)
          if (response.data.amount > amount) {
            const updatedCart = [...cart]
            const productInCart = updatedCart.find(product => product.id === productId)

            if (productInCart) {
              productInCart.amount = amount
              setCart(updatedCart)
            }
            else {
              throw Error()
            }
          }
          else {
            toast.error('Quantidade solicitada fora de estoque');
          }
        }
        catch {
          toast.error('Erro na alteração de quantidade do produto');
        }
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
