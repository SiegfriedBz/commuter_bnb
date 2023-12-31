import React from 'react'
import { ITransactionUser } from './BookingRequestCard'
import { ButtonSlide } from '../../../components/buttons/'

interface IProps {
    transactionRequestId: number,
    currentUser: ITransactionUser,
    secondUser: ITransactionUser,
    isExchange: boolean,
    isPureExchange: boolean,
    onCreatePayment: (
        payerId: number,
        payeeId: number) => void
}

const BookingGoToPayment: React.FC<IProps> = (props) => {
    const 
        { 
            transactionRequestId,
            currentUser,
            secondUser,
            isExchange,
            isPureExchange,
            onCreatePayment } = props

    //* handlers 
    const handleCreatePayment = async (payerId: number, payeeId: number) => {
        await onCreatePayment(payerId,payeeId)
    }

    // waiting for both parties to agree
    if(!currentUser.agreedTransaction || !secondUser.agreedTransaction ) return null

    // not exchange scenario
    if(!isExchange) {
        if(currentUser.isTransactionInitiator) {
            // currentUser is transaction initiator: currentUser must pay
            return (
                <ButtonSlide 
                    onClick={ () => handleCreatePayment(currentUser.userId, secondUser.userId) }
                    className="btn-slide fs-5 btn-selected btn-slide-primary right-slide mx-auto mt-1"
                    >
                        Proceed to payment
                </ButtonSlide>
            )
        } else {
            // currentUser is transaction responder: currentUser must be paid
            return (
                <span className="badge fs-5 fw-bolder text-white bg-primary mx-auto py-3 mt-1"
                >
                    Waiting for payment
                </span>)
        }
    } else {
    // exchange scenario
        // pure exchange scenario => "0" value payment
        if(isPureExchange) {
            return (
                <ButtonSlide 
                    onClick={ () => handleCreatePayment(currentUser.userId, secondUser.userId) }
                    className="btn-slide fs-5 btn-selected btn-slide-primary right-slide mx-auto mt-1"
                >
                    Proceed to free booking
                </ButtonSlide>
            )
        } else {
        // not pure exchange scenario
            // currentUser is Payer
            if(currentUser.isPayer) {
                return (
                    <ButtonSlide 
                        onClick={ () => handleCreatePayment(currentUser.userId, secondUser.userId) }
                        className="btn-slide fs-5 btn-slide-primary right-slide mx-auto mt-1"
                    >
                        Proceed to payment
                    </ButtonSlide>
                ) 
            } else {
            // currentUser is not Payer
                return (
                    <span className="badge fs-5 fw-bolder text-white bg-primary mx-auto py-3 mt-1"
                    >
                        Waiting for payment
                    </span>)
            }
        }
    }
}

export default BookingGoToPayment
