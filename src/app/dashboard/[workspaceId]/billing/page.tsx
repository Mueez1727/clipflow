import { getPaymentInfo } from '@/actions/user'
import React from 'react'

const BillingPage = async () => {
  const payment = await getPaymentInfo()

  return (
    <div className="dashboard-surface flex flex-col gap-y-8 p-5">
      <div>
        <h2 className="text-2xl">Current Plan</h2>
        <p className="text-muted-foreground">Your Payment History</p>
      </div>
      <div>
        <h2 className="text-2xl">
          ${payment?.data?.subscription?.plan === 'PRO' ? '99' : '0'}/Month
        </h2>
        <p className="text-muted-foreground">{payment?.data?.subscription?.plan ?? 'FREE'}</p>
      </div>
    </div>
  )
}

export default BillingPage
