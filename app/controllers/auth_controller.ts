import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async index({ view }: HttpContext) {
    return view.render('pages/signin')
  }

  async signIn({ request, response, session }: HttpContext) {
    const adminUsername = env.get('ADMIN_USERNAME')
    const adminPassword = env.get('ADMIN_PASSWORD')

    const { username, password } = request.only(['username', 'password'])

    const isUsernameValid = username === adminUsername
    const isPasswordValid = password === adminPassword

    if (isUsernameValid && isPasswordValid) {
      session.put('isAdmin', true)
      return response.redirect().toRoute('/seller/products')
    } else {
      session.flash('error', 'Invalid credentials')
      return response.redirect().toRoute('/sign-in')
    }
  }

  async signOut({ response, session }: HttpContext) {
    session.forget('isAdmin')
    return response.redirect().toRoute('/sign-in')
  }
}
