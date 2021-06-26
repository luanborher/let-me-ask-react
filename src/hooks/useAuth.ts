import { AuthContext } from '../contexts/AuthContext'
import { useContext } from 'react'

export const useAuth = () => {
    const value = useContext(AuthContext)

    return value
}