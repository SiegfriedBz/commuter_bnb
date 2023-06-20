import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks'
import { useAppContext, useUserContext, useFlatsContext } from '../../contexts'
import { IFlat } from '../../utils/interfaces'
import { FlashMessage, TotalPriceAndDays } from '../../components'

interface ITransactionRequest {
    starting_date: string,
    ending_date: string,
    exchange_price_per_night_in_cents?: number,
    responder_id?: number,
    initiator_id?: number,
    responder_flat_id?: number,
    initiator_flat_id?: number
}

const currentDate = new Date()
const endingDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000)

const initFormValues = {
    starting_date: currentDate.toISOString().slice(0, 10),
    ending_date: endingDate.toISOString().slice(0, 10),
};

const BookingForm = () => {
    // hooks
    const { id: hostFlatId } = useParams()
    const { createTransactionRequest } = useFetch()
    const navigate = useNavigate()

    // contexts
    const { flashMessage, setFlashMessage } = useAppContext()
    const { user } = useUserContext()
    const { flats } = useFlatsContext()

    // state
    const [responderFlat, setResponderFlat] = useState(undefined)
    const [currentUserFlats, setCurrentUserFlats] = useState([])
    const [currentUserSelectedFlatId, setCurrentUserSelectedFlatId] = useState(undefined)
    const [pricePerNightInCents, setPricePerNightInCents] = useState(undefined)
    const [isForExchange, setIsForExchange] = useState(false)
    const [formValues, setFormValues] = useState(initFormValues)

    // set responderFlat & responder_id, responder_flat_id, exchange_price_per_night_in_cents in form
    useEffect(() => {
        if(!flats || !hostFlatId) return

        const hostFlat = flats.find(flat => flat.flatId === parseInt(hostFlatId))
        if(!hostFlat) return

        const hostFlatOwnerId = hostFlat?.owner?.userId
        const initPricePerNightInCents = hostFlat?.pricePerNightInCents

        setResponderFlat(hostFlat)
        setPricePerNightInCents(initPricePerNightInCents)
        setFormValues((prev) => {
            return {
                ...prev,
                responder_flat_id: hostFlatId,
                responder_id: hostFlatOwnerId,
                exchange_price_per_night_in_cents: initPricePerNightInCents
        }})
    }, [flats, hostFlatId])
    
    // set currentUserFlats if any
    useEffect(() => {
        if(!flats) return

        const currentUserFlats = flats.filter(flat => flat.owner.userId === user.userId)

        setCurrentUserFlats(currentUserFlats)
    }, [flats])
    
    // init exchange scenario: set initiator_flat_id && price_per_night_in_cents
    useEffect(() => {
        if(!responderFlat || !currentUserFlats) return

        const responderFlatPricePerNightInCents = responderFlat?.pricePerNightInCents

        const currentUserSelectedFlat = isForExchange ?
            currentUserFlats.find(flat => flat.flatId === currentUserSelectedFlatId) || currentUserFlats[0]
            : undefined

        const currentUserSelectedFlatPricePerNightInCents = isForExchange ?
            currentUserSelectedFlat?.pricePerNightInCents
            : 0

        const newPricePerNightInCents = isForExchange ?
            responderFlatPricePerNightInCents - currentUserSelectedFlatPricePerNightInCents
            : responderFlatPricePerNightInCents
        
        setPricePerNightInCents(newPricePerNightInCents)
        setFormValues((prev) => {
            return {
                ...prev,
                initiator_flat_id: currentUserSelectedFlatId,
                exchange_price_per_night_in_cents: newPricePerNightInCents,
            }
        })
    }, [responderFlat, currentUserFlats, currentUserSelectedFlatId, isForExchange])

    // handlers
    const toggleIsForExchange = () => {
        setIsForExchange((prev: boolean) => !prev)
    }

    // only for dates with the current form
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        let formatedFormValues = { ...formValues}
        Object.keys(formValues).forEach((key) => {
            if(key === "starting_date"|| key === "ending_date") {
                const [year, month, day] = formValues[key].split("-");
                const dateIsoString = new Date(year, month - 1, day).toISOString();
                formValues[key] = dateIsoString
            }
        })

        // create transaction request
        const fetchedNewTransactionRequest = await createTransactionRequest(responderFlat.flatId, formatedFormValues)
                
        if(fetchedNewTransactionRequest) {
            const data= fetchedNewTransactionRequest[1]
            setFlashMessage({ message: data.message, type: "success" })
        } else {
            setFlashMessage({ message: "Booking request creation went wrong", type: "warning" })
        }

        setTimeout(() => {
            setFlashMessage({ message: null, type: "success" })
        }, 3000)
        
        setFormValues((prev) => {
            return {
                ...prev,
                starting_date: initFormValues.starting_date,
                ending_date: initFormValues.ending_date
            }
        })

        // nav to BookingRequestListPage
        navigate("/my-booking-requests")
    }

    const renderCurrentUserFlatsList = () => {
        return (
            <select
            id="initiator_flat_id"
            name="initiator_flat_id"
            className="form-control mb-2"
            onChange={(e) => setCurrentUserSelectedFlatId(parseInt(e.target.value))}
            >
                {currentUserFlats.map((flat: IFlat) => {
                    return (
                        <option
                            key={flat.flatId}
                            value={flat?.flatId}>My property: {flat.title}, ${flat?.pricePerNightInCents/100} per night
                            </option>
                    )})
                }
            </select>
        )
    }

    return (
        <>
          <h3 className="text-info">Request booking</h3>
          {flashMessage.message && <FlashMessage message={flashMessage.message} type={flashMessage.type} />}
          {currentUserFlats.length > 0 && 
            <div className="d-flex-mb-2">
                <div className="form-check form-switch">
                    <input 
                        id="isForExchange" 
                        type="checkbox"
                        role="switch"
                        className="form-check-input"
                        checked={isForExchange}
                        onChange={toggleIsForExchange}
                        />
                    <label htmlFor="#isForExchange" className={`form-check-label ${isForExchange && "text-info fw-bold"}`} >Exchange</label>
                </div>
            </div>
          }

          {isForExchange && renderCurrentUserFlatsList()}
        
          <form onSubmit={handleSubmit}>
              <div className="form-group">
                  <label htmlFor="starting_date">from</label>
                  <input  type="date" 
                          className="form-control" 
                          id="starting_date" 
                          name="starting_date"
                          value={formValues.starting_date}
                          onChange={handleDateChange}
                  />
                  <label htmlFor="ending_date">to</label>
                  <input  type="date" 
                          className="form-control" 
                          id="ending_date" 
                          name="ending_date"
                          value={formValues.ending_date}
                          onChange={handleDateChange}
                  />
              </div>
              <button type="submit" className="btn btn-sm btn-outline-primary my-2">Submit</button>
          </form>
          {formValues?.starting_date && formValues?.ending_date &&
            <TotalPriceAndDays 
              pricePerNightInCents={pricePerNightInCents}
              starting_date={formValues.starting_date}
              ending_date={formValues.ending_date}
            />
          }
        </>
    )
}

export default BookingForm