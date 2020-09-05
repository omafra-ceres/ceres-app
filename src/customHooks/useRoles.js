import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const useRoles = () => {
  const { isLoading, getIdTokenClaims } = useAuth0()
  const [ roles, setRoles ] = useState()

  useEffect(() => {
    const getToken = async () => {
      const token = await getIdTokenClaims()
      if (token) {
        setRoles(token["http://omafra-ceres.herokuapp.com/roles"] || [])
      } else if (!isLoading) {
        setRoles([])
      }
    }
    getToken()
  }, [getIdTokenClaims, isLoading])

  return roles
}

export default useRoles