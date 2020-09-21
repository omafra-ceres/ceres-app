import { useCallback, useMemo } from 'react'
import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'

axios.defaults.baseURL = process.env.REACT_APP_API_URL

let savedToken

const useAPI = (noAuth = false) => {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0()
  
  const gettingToken = useMemo(async () => {
    if (noAuth) return
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
  }, [getAccessTokenSilently, getAccessTokenWithPopup, noAuth])

  const request = useCallback(async config => {
    await gettingToken
    return axios(config)
  }, [ gettingToken ])
  
  return useMemo(() => ({
    get: (url, config) => request({ method: "get", url, ...config }),
    put: (url, data, config) => request({ method: "put", url, data, ...config }),
    post: (url, data, config) => request({ method: "post", url, data, ...config }),
    delete: (url, data, config) => request({ method: "delete", url, data, ...config }),
  }), [request])
}

export default useAPI