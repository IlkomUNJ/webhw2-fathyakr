import Product from '#models/product'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const PRODUCTS = [
  {
    name: 'One Piece Shirt',
    sold: 11,
    price: 120000,
    image_url: 'resources/images/shirt.jpeg',
  },
  {
    name: 'One Piece Tumbler',
    sold: 9,
    price: 85000,
    image_url: 'resources/images/tumbler.jpeg',
  },
  {
    name: 'One Piece Messenger Bag',
    sold: 5,
    price: 150000,
    image_url: 'resources/images/One Piece Messenger Bag.jpeg',
  },
  {
    name: 'Chopper Plushie',
    sold: 3,
    price: 75000,
    image_url: 'resources/images/plushie.jpeg',
  },
  {
    name: 'Acrylic Keychain',
    sold: 2,
    price: 55000,
    image_url: 'resources/images/keychain.jpeg',
  },
  {
    name: 'Zoro Action Figure',
    sold: 1,
    price: 95000,
    image_url: 'resources/images/zoro figure.jpeg',
  },
  {
    name: 'Sanji Vinyl Figure',
    sold: 3,
    price: 110000,
    image_url: 'resources/images/sanji figure.jpeg',
  },
]

export default class extends BaseSeeder {
  async run() {
    for (const PRODUCT of PRODUCTS) {
      await Product.create(PRODUCT)
    }
  }
}
