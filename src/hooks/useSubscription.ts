import { useState } from 'react'
import axios from 'axios'
import { buildApiUrl } from '@/lib/api-url'

export const useSubscription = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const onSubscribe = async () => {
    setIsProcessing(true)
    try {
      const response = await axios.get(buildApiUrl('/payment'))
      if (response.data.status === 200) {
        return (window.location.href = `${response.data.session_url}`)
      }
      setIsProcessing(false)
    } catch (error) {
      console.log(error, '🔴')
    }
  }
  return { onSubscribe, isProcessing }
}