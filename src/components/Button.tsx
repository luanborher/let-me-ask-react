import '../styles/button.scss'

import { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isOutLined?: boolean
}

export function Button({ isOutLined = false, ...props }: ButtonProps) {
  return (
    <button className={`button ${isOutLined ? 'outlined' : ''}`} {...props} />
  )
}
