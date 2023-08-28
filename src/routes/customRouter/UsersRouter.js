import CustomRouter from './CustomRouter.js'
import { getUserData, registerUser, getTickets, getAllUsers, deleteAllUsers, removeUserById, updateUserRole } from '../../controllers/users.controller.js'

export default class UsersRouter extends CustomRouter {
  init () {
    // Here define the initialization of our routes
    this.post('/register', { policies: ['PUBLIC'] }, registerUser)
    this.get('/data', { policies: ['USER', 'ADMIN', 'PREMIUM'], strategy: 'jwt' }, getUserData)
    this.get('/tickets', { policies: ['USER', 'PREMIUM'], strategy: 'jwt' }, getTickets)
    this.get('/', { policies: ['ADMIN'], strategy: 'jwt' }, getAllUsers)
    this.delete('/', { policies: ['ADMIN'], strategy: 'jwt' }, deleteAllUsers)
    this.delete('/:uid', { policies: ['ADMIN'], strategy: 'jwt' }, removeUserById)
    this.put('/role', { policies: ['ADMIN'], strategy: 'jwt' }, updateUserRole)
  }
}
