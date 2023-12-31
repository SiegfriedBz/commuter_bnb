import React, { useState, useEffect, useRef, useCallback } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import clsx from "clsx"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { useAppContext, useFlatsContext } from "../../contexts"
import { FlatCard } from '../flats'
import LoadingSpinners from '../LoadingSpinners'
import { IFlat } from '../../utils/interfaces'

const mapStyle = 'mapbox://styles/mapbox/streets-v9'

const ZOOMS = {
    LARGE_VIEW: 9,
    CLOSE_VIEW: 12
}

interface IUserMarker {
    longitude: number,
    latitude: number,
}

interface IFlatMarker {
    flatId: number,
    longitude: number,
    latitude: number,
    pricePerNightInCents: number,
}

interface IProps {
    selectedFlatId?: number,
    mapHeight?: number
}

const MapView: React.FC<IProps> = ({ selectedFlatId, mapHeight=600 }) => {
    //* context
    // const { user } = useUserContext()
    const { mapboxTokenRef } = useAppContext()
    const { flats } = useFlatsContext()
    
    if(!flats) return <LoadingSpinners />
    
    //* state
    const mapRef = useRef(null)
    const [mapSelectedFlat, setMapSelectedFlat] = useState<IFlat | undefined>(undefined)
    const [userMarker, setUserMarker] = useState<IUserMarker>({ longitude: 26.85, latitude: 37.76 })
    // const [userFlats, setUserFlats] = useState([])
    const [flatsMarkers, setFlatsMarkers] = useState<IFlatMarker[] | []>([])
    const [showPopup, setShowPopup] = useState(false) 

    // set mapSelectedFlat && center map on selected flat
    useEffect(() => {
        if(!flats || !selectedFlatId) return

        const selectedFlat = flats.find(flat => flat.flatId === parseInt(selectedFlatId))
        if(!selectedFlat) return

        setMapSelectedFlat(selectedFlat)

        const { longitude, latitude } = selectedFlat

        if(!longitude || !latitude) return

        // TO FIX
        mapRef.current?.flyTo({ center: [ longitude, latitude ] })
    }, [flats, selectedFlatId])


    // set flats markers
    const getflatsMarkers = useCallback(() => {
        if(!flats) return

        const newMarkers = flats.map(flat => {
              const { flatId, longitude, latitude, pricePerNightInCents } = flat
              return { flatId, longitude, latitude, pricePerNightInCents }
          })

        setFlatsMarkers(newMarkers)
    }, [flats])
    
    //* effects
    useEffect(() => {
        (async () => {
            await getflatsMarkers()
        })()
    }, [flats, getflatsMarkers])

    // 
    useEffect(() => {
        flatsMarkers?.forEach(marker => flatMarkerPriceClass(marker.flatIds))
    }, [mapSelectedFlat])

    //* helpers
    // set mapSelectedFlat on marker click & open flat popup & center map on selected flat
    const handleFlatMarkerClick = (id) => {
        const flat = flats.find(flat => flat.flatId === id)
        
        if(!flat) return
        
        setMapSelectedFlat(flat)
        setShowPopup(true)
    }

    const handlePopUpClose = () => {
        setMapSelectedFlat(undefined)
        setShowPopup(false)
    }

    //* clsx
    const flatMarkerPointerClass = (flatId) => {
        const isSelectedFlat = parseInt(flatId) === parseInt(mapSelectedFlat?.flatId)
        return clsx("marker-location", {
            "text-primary": isSelectedFlat,
            "text-info": !isSelectedFlat
        })
    }

    const flatMarkerPriceClass = (flatId) => {
        const isSelectedFlat = parseInt(flatId) === parseInt(mapSelectedFlat?.flatId)
        return clsx("marker-price badge rounded-pill", {
            "text-white text-bg-primary": isSelectedFlat,
            "text-white text-bg-info": !isSelectedFlat
        })
    }
    
    return (
        <Map
            ref={mapRef}
            initialViewState={{
                ...userMarker,
                zoom: ZOOMS.LARGE_VIEW
            }}
            style={{ height: mapHeight, width: "auto" }}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxTokenRef?.current}
            onMove={() => { getflatsMarkers() }}
        >
            <>
            {/* flatsMarkers */}
            {flats && flatsMarkers?.map(marker => {
                const { flatId, longitude, latitude, pricePerNightInCents } = marker
                    return (
                        <Marker key={flatId} longitude={longitude} latitude={latitude} >
                            <div
                                // onMouseEnter={() => { console.log("enter",flatId )}}
                                // onMouseLeave={() => { console.log("leave",flatId )}}
                                onClick={() => handleFlatMarkerClick(flatId)}
                            >
                                <div className="map-markers">
                                    <span className={flatMarkerPointerClass(flatId)}>
                                        <FontAwesomeIcon icon={faLocationDot} />
                                    </span>
                                    <span className={flatMarkerPriceClass(flatId)}>
                                        <FontAwesomeIcon icon={faDollarSign} />
                                        {pricePerNightInCents/100}
                                    </span>
                                </div>
                            </div>
                        </Marker>
                    )
            })}

            {/* flat popUp */}
            { showPopup && mapSelectedFlat?.longitude && mapSelectedFlat?.latitude &&
                <Popup
                        anchor='bottom'
                        longitude={mapSelectedFlat?.longitude}
                        latitude={mapSelectedFlat?.latitude}
                        offset={[0, -15]}
                        onClose={handlePopUpClose}
                        closeButton={true}
                        closeOnClick={false}
                >
                    <FlatCard flat={mapSelectedFlat} flatCardOnMap/>
                </Popup>
            }
            </>
        </Map>
    )
}

export default MapView
