import { Metadata } from 'next'

import { LoginPage } from '@/views/authentication'

export const metadata: Metadata = {
  title: 'Login',
}

export default function Login() {
  return (
    <div className="flex h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginPage />
      </div>
    </div>
  )
}
