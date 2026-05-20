import React from 'react'
import { requireAuth } from '../../../modules/authentication/actions'

const layout = async({children}:{children:React.ReactNode}) => {
    await requireAuth()
    return (
        <div className="flex h-screen overflow-hidden">
            <main className="flex-1 overflow-hidden">
                {children}
            </main>
        </div>
    )
}

export default layout