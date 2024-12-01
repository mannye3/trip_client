import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GetPlaceDetails, PHOTO_REF_URL } from '../services/GlobalApi'

export default function PlaceCardItem({place}) {
    const [photoUrl, setPhotoUrl]=useState()
    useEffect(() => {
    place&&GetPlacePhoto();
    
}, [place]);

const GetPlacePhoto = async () => {
 const data = {
  textQuery:place.placeName
 }
 const result =  await GetPlaceDetails(data).then(resp =>{
 console.log(resp.data.places[0].photos[3].name)
 
 const photoUrl = PHOTO_REF_URL.replace('{NAME}',resp.data.places[0].photos[3].name)

 setPhotoUrl(photoUrl)

 })
}

  return (
     <Link to={
            'https://www.google.com/maps/search/?api=1&query=' + 
            encodeURIComponent(place?.placeName)
        }
          target="_blank">
    <div className='border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 transition-all cursor-pointer hover:shadow-md'>
       <img src={photoUrl?photoUrl:'https://aitrip.tubeguruji.com/placeholder.jpg' }  className='w-[130px] object-cover  h-[130px] rounded-xl' />
       <div>
        <h2 className='font-bold text-lg '>{place.placeName}</h2>
        <p className='text-sm text-gray-400'>{place.placeDetails}</p>
        <h2 className='mt-2'>⌚ {place.timeTravel}</h2>
       </div>
    </div>
    </Link>
  )
}
