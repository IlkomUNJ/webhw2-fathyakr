import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'
import Guest from '#models/guest'

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirectTo = '/'

  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.session.get('isAdmin')) {
      const newGuestId = '99999999-9999-4999-9999-999999999999'
      ctx.response.cookie('guest_id', newGuestId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 4 * 6, // 6 months
      })
      await Guest.firstOrCreate({ uuid: newGuestId })
      return next()
    }

    if (!ctx.request.cookie('guest_id')) {
      const newGuestId = crypto.randomUUID()
      logger.info(`Assigning new guest ID: ${newGuestId.toString()}`)
      ctx.response.cookie('guest_id', newGuestId, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 * 4 * 6, // 6 months
      })
      await Guest.create({ uuid: newGuestId })
    } else {
      const existingGuest = await Guest.query()
        .where('uuid', ctx.request.cookie('guest_id'))
        .first()
      if (!existingGuest) {
        const newGuestId = crypto.randomUUID()
        logger.info(`Re-assigning new guest ID: ${newGuestId.toString()}`)
        ctx.response.cookie('guest_id', newGuestId, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7 * 4 * 6, // 6 months
        })
        await Guest.create({ uuid: newGuestId })
      }
    }

    return next()
  }
}
