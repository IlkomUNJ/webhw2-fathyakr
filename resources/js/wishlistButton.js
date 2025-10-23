document.addEventListener('DOMContentLoaded', () => {
  const wishlistButtons = document.querySelectorAll('button[data-product-id]')

  if (!wishlistButtons || wishlistButtons.length === 0) {
    console.log('No wishlist buttons found')
    return
  }

  wishlistButtons.forEach((button) => {
    button.addEventListener('click', async function () {
      const product_id = this.dataset.productId
      if (!product_id) {
        console.error('Product ID not found on button')
        return
      }
      
      console.log(`Wishlist button clicked for product ID: ${product_id}`)
      
      // Optionally, you can toggle the state instead of just setting it to active
      if (button.textContent.includes("Remove from Wishlist")) {
        try {
          const response = await fetch('/wishlist/remove', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id }),
          })
        } catch (error) {
          console.error('Error adding product to wishlist:', error)
        }
        button.textContent = "Add to Wishlist"
      } else {
        try {
          const response = await fetch('/wishlist/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id }),
          })
        } catch (error) {
          console.error('Error removing product from wishlist:', error)
        }
        button.textContent = "Remove from Wishlist"
      }
    })
  })
})