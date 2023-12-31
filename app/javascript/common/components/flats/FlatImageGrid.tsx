import React from 'react'

interface IProps {
    images?: string[]
}

const FlatImageGrid: React.FC<IProps> = ({ images }) => {
    const selectedImages = images.filter((image: string, index: number) => index < 4)

    return (
          <div className="row row-cols-2 row-gap-1 gx-1 h-100">
            {selectedImages?.map((url: string) => {
                return (
                    <div 
                        className="col"
                        key={url}
                    >
                        <img src={url} className="d-block w-100 rounded-1" alt="flat view"/>
                    </div>
                )
            })}
        </div>
    )
}

export default FlatImageGrid
