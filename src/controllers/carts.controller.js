import MailingService from '../services/MailingService.js'
import { cartService, productService, ticketService } from '../services/repositories/index.js'

// POST /api/carts/
export async function createCart (req, res) {
  try {
    const result = await cartService.createCart()
    if (!result) return res.sendServerError('The cart was not created')
    return res.sendSuccess(result)
  } catch (err) {
    return res.sendServerError(err.message)
  }
}
// GET /api/carts/:cid
export async function getCartById (req, res) {
  try {
    const { cid } = req.params
    if (typeof cid !== 'string' || !cid) { return res.sendUserError('The id cart is invalid') }
    const result = await cartService.getCart(cid)
    if (!result) return res.sendUserError('Cart not found')
    return res.sendSuccess(result)
  } catch (err) {
    return res.sendServerError(err.message)
  }
}
// PUT /api/carts/:cid/product/:pid
export async function updateProductInCart (req, res) {
  try {
    const cid = req.params.cid
    const pid = req.params.pid
    const quantity = Number(req.body.quantity)
    if (typeof Number(quantity) !== 'number') { return res.sendUserError('The quantity must be a number') }
    if (typeof cid !== 'string' || typeof pid !== 'string') { return res.sendUserError('The id provided must be a string') }
    if (!cid || !pid) { return res.sendUserError('One or both given ids are invalid') }
    const result = await cartService.updateProduct({
      idCartGiven: cid,
      idProductGiven: pid,
      quantity
    })
    if (!result) return res.sendUserError('Cart or product not found')
    return res.sendSuccess(result)
  } catch (err) {
    req.logger.warning(`Error at update a cart. reason: ${err.message}`)
    return res.sendServerError(err.message)
  }
}
// PUT /api/carts/:cid
export async function addProductstoCart (req, res) {
  try {
    const { cid } = req.params
    const products = req.body
    if (typeof cid !== 'string') { return res.sendUserError('The id provided must be a string') }
    if (!Array.isArray(products)) { return res.sendUserError('The data received is not an Array') }
    const result = await cartService.insertProducts({
      arrProducts: products,
      cartId: cid
    })
    if (!result) { return res.sendUserError('One or both ids provided are invalid') }
    return res.sendSuccess(result)
  } catch (error) {
    return res.sendServerError(error.message)
  }
}
// DELETE /api/carts/:cid/product/:pid
export async function deleteProductById (req, res) {
  try {
    const cid = req.params.cid
    const pid = req.params.pid
    if (typeof cid !== 'string' || typeof pid !== 'string') { return res.sendUserError('The id provided must be a string') }
    if (!cid || !pid) { return res.sendUserError('One or both given ids are invalid') }
    const result = await cartService.deleteProductById({
      cartId: cid,
      productId: pid
    })
    if (!result) {
      return res.sendServerError(
        'The product id given was not found in the cart'
      )
    }
    return res.sendSuccess(result)
  } catch (err) {
    req.logger.warning(`Error at delete product in cart. reason: ${err.message}`)
    return res.sendServerError(err.message)
  }
}
// DELETE /api/carts/:cid
export async function deleteAllproductsInCart (req, res) {
  try {
    const cid = req.params.cid
    if (typeof cid !== 'string') { return res.sendUserError('The id provided must be a string') }
    if (!cid) return res.sendUserError('cart id given invalid')
    const result = await cartService.clearCart({ cartId: cid })
    if (result === null) return res.sendUserError('The cart was not found')
    if (result.products.length === 0) return res.sendSuccessInfo('The products array from the cart was removed')
  } catch (err) {
    req.logger.warning(`Error at delete all products in cart. reason: ${err.message}`)
    return res.sendServerError(err.message)
  }
}
export async function purchase (req, res) {
  const { cid } = req.params
  const { address, creditCard } = req.body
  if (!address || typeof address !== 'string') return res.sendUserError('Address is invalid')
  if (!creditCard || isNaN(Number(creditCard))) return res.sendUserError('CreditCard is invalid')
  if (!cid) return res.sendUserError('Cart ID is invalid')

  try {
    const { products } = await cartService.getCart(cid)
    if (products.length === 0) return res.sendUserError('Could not process the buy because the cart is empty')
    const failedProducts = []
    const purchasedProducts = []

    for (const obj of products) {
      const productId = obj.product._id.toString()
      const productFromDB = await productService.getById(productId)
      const availableStock = productFromDB.stock
      if (availableStock >= obj.quantity) {
        const newStock = availableStock - obj.quantity
        await productService.updateProduct(productId, { stock: newStock })
        purchasedProducts.push({ product: productId, price: obj.product.price, quantity: obj.quantity, title: obj.product.title })
      } else {
        failedProducts.push({ product: productId, title: obj.product.title })
      }
    }

    if (purchasedProducts.length > 0) {
      const amount = purchasedProducts.reduce((acc, e) => (e.price * e.quantity) + acc, 0)
      const { _id } = await ticketService.generate({ email: req.user.email, amount: amount.toFixed(2), products: purchasedProducts, address })
      const ticket = await ticketService.getById({ ticketId: _id })
      req.logger.debug(`this is the ticket ${JSON.stringify(ticket)}`)
      const mail = {
        from: 'Test',
        to: req.user.email,
        subject: 'ShopFast',
        text: `Recently you have made a buy with the following products: ${purchasedProducts.map(e => `${e.title} x ${e.quantity}`).join(', ')}
        And these products could not processed: ${failedProducts.map(e => e.title).join(', ') || 0}
        Total amount: $${ticket.amount}

        Thanks for your buy!
        `
      }
      const mailingService = new MailingService()
      await mailingService.sendSimpleMail(mail)
    }

    await cartService.insertProducts({ cartId: cid, arrProducts: failedProducts })

    if (failedProducts.length > 0) {
      return res.sendUserErrorPayload({ failedProducts, purchasedProducts })
    } else {
      return res.sendSuccessInfo('Purchase succesfully, all the products were bought')
    }
  } catch (error) {
    req.logger.warning(`Could not perfom the purchase. reason: ${error.message}`)
    return res.sendServerError(error.message)
  }
}
