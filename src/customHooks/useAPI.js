import { useCallback, useMemo } from 'react'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'

axios.defaults.baseURL = process.env.REACT_APP_API_URL

let savedToken

const useAPI = () => {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0()
  
  const gettingToken = useMemo(async () => {
    if (savedToken) return savedToken
    savedToken = getAccessTokenSilently({
      audience: 'ceres-api'
    }).catch(() => (
      getAccessTokenWithPopup({
        audience: 'ceres-api'
      }).catch(console.error)
    ))

    axios.defaults.headers.common['Authorization'] = `Bearer ${await savedToken}`
    return savedToken
  }, [getAccessTokenSilently, getAccessTokenWithPopup])

  const apiGet = useCallback(async (...args) => {
    await gettingToken
    return axios.get(...args)
  }, [ gettingToken ])
  
  const apiPost = useCallback(async (...args) => {
    await gettingToken
    return axios.post(...args)
  }, [ gettingToken ])

  return useMemo(() => ({
    get: apiGet,
    post: apiPost
  }), [apiGet, apiPost])
}

export default useAPI