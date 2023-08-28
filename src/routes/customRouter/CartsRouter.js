import { addProductstoCart, createCart, deleteAllproductsInCart, deleteProductById, getCartById, updateProductInCart, purchase } from '../../controllers/carts.controller.js'
import CustomRouter from './CustomRouter.js'

export default class CartsRouter extends CustomRouter {
  init () {
    this.post('/', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, createCart)

    this.get('/:cid', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, getCartById)

    this.put('/:cid', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, addProductstoCart)

    this.delete('/:cid', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, deleteAllproductsInCart)

    this.put('/:cid/product/:pid', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, updateProductInCart)

    this.delete('/:cid/product/:pid', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, deleteProductById)
    this.post('/:cid/purchase', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, purchase)
  }
}
