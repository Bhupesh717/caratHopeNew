'use client'
import { useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

export function ApiTester() {
  useEffect(() => {
    // Calling the correct backend route: /api/public/products
    apiClient.get('/public/products')
      .then(res => {
        const d = res.data
        if (d && d.data && d.data.data && d.data.data.length > 0) {
          let p = d.data.data[0]
          console.log('--- BACKEND IP GEO DETECTION TEST ---')
          console.log('Country Detected:', p.display_currency)
          console.log('Display Price:', p.display_price)
          console.log('Local Prices:', p.local_prices)
          console.log('-------------------------------------')
        } else {
          console.log('No products found in the response to test.')
        }
      })
      .catch(err => console.error('Error fetching API for test:', err))
  }, [])
  return null
}
