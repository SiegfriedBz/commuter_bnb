import React, { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useFetch } from '../../hooks'
import { useBookingRequestsContext } from '../../contexts'
import { BookingRequestCard } from '../../components/requests'
import { MessageFormModalWrapper } from '../../components/messages'
import MapView from '../../components/map/MapView'
import { ButtonScrollToTop } from '../../components'
import { IBookingRequest } from "../../utils/interfaces"
import { ButtonSlide } from '../../components'

const BookingRequestListPage: React.FC = () => {
    //* hooks
    const location = useLocation()
    const { getUserTransactionRequests } = useFetch()
    const topRef = useRef(null)
    const mapRef = useRef(null)
    const cardRef = useRef(null)

    //* context
    const { bookingRequests, setBookingRequests } = useBookingRequestsContext()

    //* state
    // transactionRequestId selected from /my-messages || /properties/:id
    const [cardRefSelectedId, setCardRefSelectedId] = useState<number | undefined>(undefined)
    // fly to flat map marker when flat is selected from a BookingRequestCard
    const [mapSelectedFlatId, setMapSelectedFlatId] = useState<number | undefined>(undefined)
    // send-message form modal
    const [modalIsOpen, setModalIsOpen] = useState(false)
    // message
    const [messageRecipientId, setMessageRecipientId] = useState<number | undefined>(undefined)
    const [messageFlatId, setMessageFlatId] = useState<number | undefined>(undefined)
    const [messageTransactionRequestId, setMessageTransactionRequestId] = useState<number | undefined>(undefined)
    const [showOnlyPending, setShowOnlyPending] = useState(false)
    console.log('BookingRequestListPage bookingRequests', bookingRequests)
    
    //* effects
    // fetch all transaction requests and set them in context
    useEffect(() => {
      (async () => {
        await getAllTransactionRequests()
      })()
    }, [])
    
    // set cardRef on card w/ transactionRequestId selected from /my-messages || /properties/:id
    useEffect(() => {
      if(bookingRequests.length === 0 || !location?.state?.selectedBookingRequestId) return
      
      const selectedBookingRequestId = location.state?.selectedBookingRequestId
      
      setCardRefSelectedId(selectedBookingRequestId)
    }, [bookingRequests, location])

    // scroll to card w/ transactionRequestId === cardRefSelectedId
    useEffect(() => {
      if(bookingRequests.length === 0 || !cardRefSelectedId) return 
      
      cardRef?.current.goIntoView()

    }, [bookingRequests, cardRefSelectedId])

    //* helpers
    const getAllTransactionRequests = async() => {
      const fetchedBookingRequests = await getUserTransactionRequests()        
      if (!fetchedBookingRequests) return

      const [response, data] = fetchedBookingRequests
      if(!data) return

      const bookingRequests: IBookingRequest[] | undefined = data?.transaction_requests
      if(!bookingRequests) return

      setBookingRequests(bookingRequests)
    }

    const handleSendMessage = (messageRecipientId: number, messageFlatId: number, messageTransactionRequestId: number) => {
      // set message
      setMessageRecipientId(messageRecipientId)
      setMessageFlatId(messageFlatId)
      setMessageTransactionRequestId(messageTransactionRequestId)
      // open send-message modal
      toggleModal()
    }

    const toggleModal = () => {
      setModalIsOpen(prev => !prev)
    }

    const scrollToTop = () => {
      topRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    // scroll to map on mobile
    const scrollToMap = () => {
      mapRef.current.scrollIntoView({ behavior: 'smooth' })
    }

    const selectedBookingRequests = showOnlyPending ?
      bookingRequests.filter(bookingRequest => bookingRequest.status === 'pending')
      : bookingRequests
    
    return (
        <>
          <MessageFormModalWrapper 
            modalIsOpen={modalIsOpen}
            toggleModal={toggleModal}
            messageRecipientId={messageRecipientId}
            messageFlatId={messageFlatId}
            messageTransactionRequestId={messageTransactionRequestId}
          />
          <div ref={topRef} className="d-flex justify-content-center justify-content-lg-start mt-2 mb-3">
            <ButtonSlide
              className=" fs-5 btn-slide btn-slide-primary right-slide"
              onClick={() => setShowOnlyPending(!showOnlyPending)}
            >
              Show {showOnlyPending ? "all booking requests" : "only pending booking requests"} 
            </ButtonSlide>
          </div>
          <div className="row">
            {bookingRequests.length === 0 ?
              ( <span className="d-block my-1">You don't have active booking requests yet,
                  <span className="text-dark fw-bolder"> start exploring the properties on the map</span>
                </span>
              )
              :
              ( <div className={`col-12 ${selectedBookingRequests.length > 0 && "col-xl-5"}`}>
                {selectedBookingRequests?.map((bookingRequest) => {
                  return (
                    <BookingRequestCard
                        key={bookingRequest.transactionRequestId}
                        ref={bookingRequest.transactionRequestId === cardRefSelectedId ? cardRef : null}
                        transactionRequest={bookingRequest}
                        handleSendMessage={handleSendMessage}
                        setMapSelectedFlatId={setMapSelectedFlatId}
                        scrollToMap={scrollToMap}
                    />
                  )
                })}
              </div>
              )
            }
            <div className={`col-12 ${selectedBookingRequests.length > 0 && "col-xl-7"}`}>
              <div className='sticky-top'>
                <div ref={mapRef}>
                  <MapView selectedFlatId={mapSelectedFlatId} mapHeight={700} />
                </div>
                <ButtonScrollToTop scrollToTop={scrollToTop} />
              </div>
            </div>
          </div>
        </>
    )
}

export default BookingRequestListPage
