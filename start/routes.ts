/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.ts'

const ProductController = () => import('#controllers/products_controller')
const AuthController = () => import('#controllers/auth_controller')
const WishlistsController = () => import('#controllers/wishlists_controller')

router
  .group(() => {
    router.get('/', [ProductController, 'indexHome'])
    router.get('/products', [ProductController, 'index'])
    router.on('/about').render('pages/buyer/about')
    router.get('/wishlist', [WishlistsController, 'index'])
    router.post('/wishlist/add', [WishlistsController, 'add'])
    router.post('/wishlist/remove', [WishlistsController, 'remove'])
    router.on('/details').render('pages/details')
  })
  .middleware(middleware.guest())

router.get('/sign-in', [AuthController, 'index'])
router.post('/sign-in', [AuthController, 'signIn'])

router
  .group(() => {
    router.on('/dashboard').redirect('/products')
    router.get('/products', [ProductController, 'indexAdmin'])
    router.post('/products', [ProductController, 'store'])
    router.post('/products/:id/destroy', [ProductController, 'destroy'])
    router.get('/wishlist', [WishlistsController, 'adminIndex'])

    router.post('/sign-out', [AuthController, 'signOut'])
  })
  .prefix('/seller')
  .middleware(middleware.auth())
