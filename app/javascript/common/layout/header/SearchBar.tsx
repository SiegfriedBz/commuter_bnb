import React, { useState } from 'react'
import { useFetch } from '../../hooks/useFetch';
import { useAppContext } from '../../contexts';
import DateRangePickerWrapper from '../../components/DateRangePickerWrapper';
import ButtonSlide from '../../components/buttons/ButtonSlide';

const initFormValues = {
    city: '',
    country: '',
    starting_date: null,
    ending_date: null,
};

const SearchBar = () => {
    //* hooks
    const { getFlats } = useFetch()
    // const { setFlatsInContext } = useFlatsContext()
    const { setFlashMessage } = useAppContext()

    //* state
    const [formValues, setFormValues] = useState(initFormValues)

    //* handlers
    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        const queryParams = Object.keys(formValues)
            .reduce((acc, value) => {
                if (!formValues[value]) return acc
                acc += `${value}=${encodeURIComponent(formValues[value])}&`
                return acc
            }, '').slice(0, -1)

        console.log('queryParams', queryParams)
        
        const fetchedData = await getFlats(queryParams)
        console.log('fetchedData', fetchedData)
        
        if (!fetchedData) return

        const [response, data] = fetchedData
        console.log('data', data)
        if(!data) return

        // ADD FLASH MESSAGE IF SEARCH RETURNED NO FLATS THEN RETURNED ALL FLATS

        // setFlatsInContext(data.flats)
    }
    
    return (
        <div className="searchbar--wrapper">
            <form 
                className="search-form"
                onSubmit={handleSubmit}
            >
                <div className="form-group me-2">
                    <input
                        type="text"
                        className="form-control py-2"
                        placeholder="Search by city"
                        name="city"
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group me-2 my-1 my-lg-0">
                    <input
                        type="text"
                        className="form-control py-2"
                        placeholder="Search by country"
                        name="country"
                        onChange={handleChange}
                    />
                </div>
                <DateRangePickerWrapper 
                    formValues={formValues}
                    setFormValues={setFormValues}
                />
                <ButtonSlide className="bg-white btn-slide btn-slide-primary right-slide ms-lg-2 mt-1 mt-lg-0">
                    <span>Search</span>
                </ButtonSlide>
            </form>
        </div>
    )
}

export default SearchBar
