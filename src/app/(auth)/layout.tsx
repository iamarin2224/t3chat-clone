import React from 'react'
import { requireUnAuth } from '../../../modules/authentication/actions'

const AuthLayout = async({children}:{children:React.ReactNode}) => {
  await requireUnAuth()
  return (
    <div>
        {children}
    </div>
  )
}

export default AuthLayout