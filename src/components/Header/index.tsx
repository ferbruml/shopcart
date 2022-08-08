import React from 'react';
import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';

const Header = (): JSX.Element => {
  const { cart } = useCart();
  const uniquesProdutsInCart: number[] = []
  let cartSize: number = 0
  cart.filter(element => {
    if (!uniquesProdutsInCart.includes(element.id)) {
      uniquesProdutsInCart.push(element.id)
    }
  })
  cartSize = uniquesProdutsInCart.length

  console.log('fernanda - uniques = ', cartSize)

  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>Meu carrinho</strong>
          <span data-testid="cart-size">
            { cartSize === 1 ? `${cartSize} item` : `${cartSize} itens` }
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};

export default Header;
