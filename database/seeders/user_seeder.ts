import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const USERS = [
  {
    username: 'admin',
    email: 'admin@nakata.com',
    password: 'adminpassword',
    role: 'admin',
  },
  {
    username: 'fathyakr',
    email: 'fathyakr@gmail.com',
    password: 'password123',
    role: 'user',
  },
]

export default class extends BaseSeeder {
  async run() {
    for (const USER of USERS) {
      await User.create(USER)
    }
  }
}
