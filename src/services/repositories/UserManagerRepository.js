import RegisterUserDTO from '../dao/DTOs/RegisterUserDTO.js'
import UserDTO from '../dao/DTOs/UserDTO.js'

export default class UserManagerRepository {
  constructor (dao) {
    this.dao = dao
  }

  async getAll ({ limit, page, query }) {
    const users = await this.dao.getAll({ limit, page, query })
    return users
  }

  async getByEmail ({ email, sensitive }) {
    const result = await this.dao.getByEmail({ email })
    if (result) {
      const userFormat = new UserDTO({ user: result, sensitive })
      return userFormat
    }
    return result
  }

  async getById (id, sensitive) {
    const result = await this.dao.getById(id)
    const userFormat = new UserDTO({ user: result, sensitive })
    return userFormat
  }

  async register (newUser, sensitive) {
    try {
      const regUserFormat = new RegisterUserDTO(newUser)
      const result = await this.dao.register(regUserFormat)
      const resultFormat = new UserDTO({ user: result, sensitive })
      return resultFormat
    } catch (error) {
      throw Error(error.message)
    }
  }

  async updateUser ({ email, updates, sensitive }) {
    const result = await this.dao.updateUser({ email, updates })
    const userFormat = new UserDTO({ user: result, sensitive })
    return userFormat
  }

  async registerLastActivity ({ email }) {
    const lastAct = await this.dao.registerLastActivity({ email })
    return lastAct
  }

  async removeUserById ({ id }) {
    const result = await this.dao.removeUserById({ id })
    return result
  }

  async removeUsers () {
    const result = await this.dao.removeUsers()
    return result
  }
}
