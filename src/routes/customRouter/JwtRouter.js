import config from '../../config/config.js'
import { loginUser, loginWithGitHub, logoutUser } from '../../controllers/login.controller.js'
import CustomRouter from './CustomRouter.js'
export default class JwtRouter extends CustomRouter {
  init () {
    this.post('/login', { policies: ['PUBLIC'] }, loginUser)

    this.get('/logout', { policies: ['USER', 'ADMIN', 'PREMIUM'], strategy: 'jwt' }, logoutUser)

    this.get('/github', { policies: ['PUBLIC'], strategy: 'github', options: { scope: ['user:email'] } })

    this.get('/githubcallback', { policies: ['PUBLIC', 'USER', 'ADMIN', 'PREMIUM'], strategy: 'github', options: { failureRedirect: config.URL_REACT_APP } }, loginWithGitHub)
  }
}
