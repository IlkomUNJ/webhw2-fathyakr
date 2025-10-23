import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class WishlistsController {
  async index(ctx: HttpContext, json: boolean = false) {
    const guestId = ctx.request.cookie('guest_id')
    if (!guestId) {
      logger.error('No guest_id cookie found')
      return ctx.response.redirect('/', true)
    }

    const wishlistItems = await db
      .from('wishlists')
      .where('guest_id', guestId)
      .join('products', 'wishlists.product_id', 'products.id')
      .select('products.*', 'wishlists.id as wishlist_id')

    logger.info(`Wishlist items for guest ${guestId}: ${JSON.stringify(wishlistItems)}`)

    if (json) {
      return wishlistItems
    }

    ctx.view.share({ wishlistItems })
    return ctx.view.render('pages/buyer/wishlist')
  }

  async add(ctx: HttpContext) {
    const guestId = ctx.request.cookie('guest_id')
    if (!guestId) {
      logger.error('No guest_id cookie found')
      return ctx.response.redirect('/', true)
    }

    const productId = ctx.request.input('product_id')
    if (!productId) {
      logger.error('No product_id provided')
      return ctx.response.redirect('/', true)
    }

    const existingEntry = await db
      .from('wishlists')
      .where({ guest_id: guestId, product_id: productId })
      .first()

    if (existingEntry) {
      logger.info(`Product ${productId} already in wishlist for guest ${guestId}`)
      return ctx.response.redirect(ctx.request.header('referer') || '/', true)
    }

    await db.insertQuery().table('wishlists').insert({
      guest_id: guestId,
      product_id: productId,
      created_at: new Date(),
      updated_at: new Date(),
    })

    logger.info(`Added product ${productId} to wishlist for guest ${guestId}`)
    return ctx.response.redirect(ctx.request.header('referer') || '/', true)
  }

  async remove(ctx: HttpContext) {
    const guestId = ctx.request.cookie('guest_id')
    if (!guestId) {
      logger.error('No guest_id cookie found')
      return ctx.response.redirect('/', true)
    }

    const productId = ctx.request.input('product_id')
    if (!productId) {
      logger.error('No product_id provided')
      return ctx.response.redirect('/', true)
    }

    const deletedRows = await db
      .from('wishlists')
      .where({ product_id: productId, guest_id: guestId })
      .delete()

    if (deletedRows.length === 0) {
      logger.warn(`No wishlist entry found with product ID ${productId} for guest ${guestId}`)
    } else {
      logger.info(`Removed wishlist entry ${productId} for guest ${guestId}`)
    }

    return ctx.response.redirect(ctx.request.header('referer') || '/', true)
  }

  async clear(ctx: HttpContext) {
    const guestId = ctx.request.cookie('guest_id')
    if (!guestId) {
      logger.error('No guest_id cookie found')
      return ctx.response.redirect('/', true)
    }

    await db.from('wishlists').where('guest_id', guestId).delete()
    logger.info(`Cleared wishlist for guest ${guestId}`)
    return ctx.response.redirect(ctx.request.header('referer') || '/', true)
  }

  async adminIndex(ctx: HttpContext) {
    const wishlistItems = await db
      .from('wishlists')
      .join('products', 'wishlists.product_id', 'products.id')
      .select(
        'products.*',
        'wishlists.id as wishlist_id',
        'wishlists.guest_id',
        'wishlists.created_at as added_at'
      )
      .orderBy('wishlists.created_at', 'desc')

    logger.info(`Admin fetched ${wishlistItems.length} wishlist items`)

    ctx.view.share({ wishlistItems })
    return ctx.view.render('pages/sellerWishlists')
  }
}
