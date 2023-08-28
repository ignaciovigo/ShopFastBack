import config from '../../../config/config.js'
import userModel from '../../../models/users.model.js'

export default class userManagerMongo {
  static #instance
  constructor () {
    if (!userManagerMongo.#instance) {
      userManagerMongo.#instance = this
      return
    }
    return userManagerMongo.#instance
  }

  async getAll ({ limit = 10, page = 1, query = null }) {
    try {
      const inputQuery = query ? { $or: [{ email: { $regex: '^' + query, $options: 'i' } }, { fullName: { $regex: query, $options: 'i' } }] } : {}
      const user = await userModel.paginate({ ...inputQuery, email: { $ne: config.ADMIN_GMAIL_ACC } }, { page, limit, select: { password: 0 } }, { lean: true })
      return user
    } catch (error) {
      throw Error(error.message)
    }
  }

  async getByEmail ({ email }) {
    try {
      const user = await userModel.findOne({ email })
      return user
    } catch (error) {
      throw Error(error.message)
    }
  }

  async getById ({ id }) {
    try {
      const user = await userModel.findOne({ _id: id })
      return user
    } catch (error) {
      throw Error(error.message)
    }
  }

  async register (newUser) {
    try {
      const result = await userModel.create(newUser)
      return result
    } catch (error) {
      throw Error(error.message)
    }
  }

  async updateUser ({ email, updates }) {
    try {
      const userUpdated = await userModel.findOneAndUpdate(
        { email },
        { ...updates },
        { new: true }
      )
      if (!userUpdated) throw Error('User not found')
      return userUpdated
    } catch (error) {
      throw Error(`Could not modify the user: ${error.message}`)
    }
  }

  async registerLastActivity ({ email }) {
    try {
      const lastAct = await userModel.findOneAndUpdate({ email }, { lastActivity: new Date() }, { new: true })
      return lastAct
    } catch (error) {
      throw Error(`Could not modify the last activity: ${error.message}`)
    }
  }

  async removeUserById ({ id }) {
    try {
      const result = await userModel.deleteOne({ _id: id })
      console.log(result)
      if (result.deletedCount === 1) return 'The user was deleted successfully'
      if (result.acknowledged && result.deletedCount === 0) return null
      if (!result.acknowledged) throw { name: 'client', message: 'The data to perform the query is incorrect' }
      return result
    } catch (error) {
      if (error.name === 'CastError') throw new Error(`Invalid ${error.path}: ${error.value}`)
      throw Error(`Could not remove the user: ${error.message}`)
    }
  }

  async removeUsers () {
    const cutOffDate = new Date()
    cutOffDate.setDate(cutOffDate.getDate() - 2)
    try {
      const inactiveUsers = await userModel.find({ lastActivity: { $lt: cutOffDate }, email: { $ne: config.ADMIN_GMAIL_ACC } }, { _id: 1, email: 1 })
      const result = await userModel.deleteMany({ _id: { $in: inactiveUsers.map(user => user._id) } })
      return { inactiveUsers, deletResult: result }
    } catch (error) {
      throw Error(`Could not remove all the inactive users : ${error.message}`)
    }
  }
}
