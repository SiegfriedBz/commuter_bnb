import React, { useState, useEffect } from 'react'
import { useFetch } from '../hooks'
import { useAppContext, useFlatsContext } from '../contexts'
import { formatedDate } from '../utils/helpers/formatedDate'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { LoadingSpinners } from '../components'

const HostedBy: React.FC<number> = ({ selectedFlatId }) => {
  const { getFlatDetails } = useFetch()
  const { isLoading } = useAppContext()
  const { updateFlatInContext } = useFlatsContext()

  const [hostFlat, setHostFlat] = useState(null)

  useEffect(() => {
    if(!selectedFlatId) return

    (async () => {
      const fetchedData = await getFlatDetails(selectedFlatId)
      if (!fetchedData) return
  
      const [response, data] = fetchedData
      if(!data) return

      const hostFlat = data?.flat
      if(!hostFlat) return

      setHostFlat(hostFlat)
      updateFlatInContext(hostFlat)
    })()

  }, [selectedFlatId])

  if(isLoading) return <LoadingSpinners />

  if(!hostFlat || !hostFlat?.owner) return null

  const { owner: { email, description, createdAt } } = hostFlat

  return (
    <div>
       <h2 className="text-dark">Host</h2>
        <span className="d-block">
          <FontAwesomeIcon icon={faUser} />
          {" "}{email.split("@")[0]}
        </span>
        {description && <span className="d-block">{description}</span>}
        <span>Member since {formatedDate(createdAt)}</span>
    </div>
  )
}

export default HostedBy
