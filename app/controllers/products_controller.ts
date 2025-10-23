import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

export default class ProductsController {
  async index({ request, view }: HttpContext, json: boolean = false) {
    const searchTerm = request.input('search')
    const products = await db
      .from('products')
      .if(searchTerm, (query) => {
        query.where('products.name', 'like', `%${searchTerm}%`)
      })
      .select('products.*')
      .orderBy('products.created_at', 'desc')

    if (json) {
      return products
    }

    view.share({ products })
    return view.render('pages/buyer/products')
  }

  async indexHome({ request, view }: HttpContext, json: boolean = false) {
    let products = await this.index({ request, view } as HttpContext, true)
    products = products.slice(0, 3)
    return view.render('pages/buyer/home', { products })
  }

  async indexAdmin({ view }: HttpContext) {
    const products = await db.from('products').select('products.*').orderBy('products.id', 'asc')
    return view.render('pages/sellerProducts', { products })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext, redirect: boolean = true) {
    logger.info('Storing new product...')

    const productData = request.only([
      'name',
      'sold',
      'price',
      'image_url',
      'created_at',
      'updated_at',
    ])

    productData.created_at = new Date()
    productData.updated_at = new Date()

    const trx = await db.transaction()

    try {
      await trx.insertQuery().table('products').insert(productData).returning('id')

      await trx.commit()
      logger.info('Product stored successfully.')
    } catch (error) {
      await trx.rollback()
      logger.error('Error storing product:', error)
      throw error
    }

    if (!redirect) {
      return response.status(201).json({ message: 'Product created successfully' })
    }

    return response.redirect().toRoute('/seller/products')
  }

  async show({ params }: HttpContext) {
    logger.info(`Fetching product with ID: ${params.id}`)
    const product = await db
      .from('products')
      .where('products.id', params.id)
      .join('product_variants', 'products.id', 'product_variants.product_id')
      .select(
        'products.*',
        'product_variants.color',
        'product_variants.price',
        'product_variants.image_url'
      )
      .first()

    if (!product) {
      logger.warn(`No product found with ID: ${params.id}`)
      return null
    }

    logger.info(`Product fetched successfully: ${product.name}`)
    return product
  }

  /**
   * Edit individual record
   */
  async edit({ params, view }: HttpContext) {
    const product = await db
      .from('products')
      .select('products.*')
      .where('products.id', params.id)
      .first()

    if (!product) {
      return view.render('errors/not_found', { message: 'Product not found' })
    }

    return view.render('pages/seller/products', { product })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext, redirect: boolean = true) {
    logger.info(`Updating product with ID: ${params.id}`)
    const productData = request.only([
      'name',
      'brand',
      'description',
      'color',
      'price',
      'image_url',
      'updated_at',
    ])

    productData.updated_at = new Date()

    const trx = await db.transaction()

    try {
      const updatedCount = await trx.from('products').where('id', params.id).update(productData)

      if (updatedCount.length === 0) {
        await trx.rollback()
        logger.warn(`No product found with ID: ${params.id}`)
        if (!redirect) {
          return response.status(404).json({ message: 'Product not found' })
        }
        return response.redirect().toRoute('/seller/products')
      }

      await trx.commit()
      logger.info(`Product with ID: ${params.id} updated successfully.`)
    } catch (error) {
      await trx.rollback()
      logger.error('Error updating product:', error)
      throw error
    }

    if (!redirect) {
      return response.status(200).json({ message: 'Product updated successfully' })
    }

    return response.redirect().toRoute('/seller/products/:id/edit', { id: params.id })
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext, redirect: boolean = true) {
    logger.info(`Deleting product with ID: ${params.id}`)
    const trx = await db.transaction()

    try {
      const deletedRows = await trx.from('products').where('id', params.id).delete()

      if (deletedRows.length === 0) {
        logger.warn(`No product found with ID: ${params.id}`)
      } else {
        await trx.commit()
        logger.info(`Product with ID: ${params.id} deleted successfully.`)
      }
    } catch (error) {
      await trx.rollback()
      logger.error('Error deleting product:', error)
      throw error
    }

    if (!redirect) {
      return response.status(200).json({ message: 'Product deleted successfully' })
    }

    return response.redirect().toRoute('/seller/products')
  }
}
