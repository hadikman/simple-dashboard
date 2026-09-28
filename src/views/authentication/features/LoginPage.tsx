'use client'

import React from 'react'

import { LoginForm } from './components/LoginForm'
import { RegistrationForm } from './components/RegisterationForm'

export function LoginPage() {
  const [isLogin, setIsLogin] = React.useState(true)

  return isLogin ? (
    <LoginForm onSwitchForm={setIsLogin} />
  ) : (
    <RegistrationForm onSwitchForm={setIsLogin} />
  )
}
