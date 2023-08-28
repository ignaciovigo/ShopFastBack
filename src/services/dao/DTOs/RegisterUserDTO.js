import config from '../../../config/config.js'
import { createHash, randomString } from '../../../utils.js'

export default class RegisterUserDTO {
  constructor ({ firstName, lastName, email, age, password, githubId, username, cartId }) {
    this.firstName = firstName || null
    this.lastName = lastName || null
    this.fullName = (firstName && lastName) ? `${firstName} ${lastName}` : username
    this.email = email
    this.age = age || null
    this.password = createHash(password ?? randomString(12))
    this.role = email === config.ADMIN_GMAIL_ACC ? 'ADMIN' : 'USER'
    this.githubId = githubId || null
    this.cartId = cartId
  }
}
