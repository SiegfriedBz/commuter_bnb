import React from 'react'
import FlatCategoryEnum from '../../utils/constants/flatCategoryEnum'
import { IFlat } from '../../utils/interfaces'

const FlatDescription: React.FC<IFlat> = ({ flat }) => {
    const { title, description, city, country, pricePerNightInCents, category } = flat
    const address = `${city}, ${country}`

    const flatCategory = category === FlatCategoryEnum.ENTIRE_PLACE_SERVER ?
    FlatCategoryEnum.ENTIRE_PLACE
    : FlatCategoryEnum.PRIVATE_ROOM

    return (
        <>
            <h2 className="text-info">{title}</h2>
            <p className="fw-bold">{description}</p>
            <span className="d-block">{address}</span>
            <span className="d-block">Category: {flatCategory}</span>
            <span className="d-block">Price per night: ${pricePerNightInCents/100}</span>
        </>
    )
}

export default FlatDescription
