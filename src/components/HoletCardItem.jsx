// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { GetPlaceDetails, PHOTO_REF_URL } from "../services/GlobalApi";

// export default function HoletCardItem({ hotel }) {
//   const [photoUrl, setPhotoUrl] = useState();
//   useEffect(() => {
//     hotel && GetPlacePhoto();
//   }, [hotel]);

//   const GetPlacePhoto = async () => {
//     const data = {
//       textQuery: hotel.name,
//     };
//     const result = await GetPlaceDetails(data).then((resp) => {
//       console.log(resp.data.places[0].photos[3].name);

//       const photoUrl = PHOTO_REF_URL.replace(
//         "{NAME}",
//         resp.data.places[0].photos[3].name
//       );

//       setPhotoUrl(photoUrl);
//     });
//   };
//   return (
//     <Link
//       to={
//         "https://www.google.com/maps/search/?api=1&query=" +
//         encodeURIComponent(hotel?.name, hotel?.address)
//       }
//       target="_blank"
//     >
//       <div className="hover:scale-105 transition-all cursor-pointer">
//         <img
//           src={
//             photoUrl
//               ? photoUrl
//               : "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
//           }
//           className="rounded-xl h-[180px] w-full object-cover"
//         />
//         <div className="my-2">
//           <h2 className="font-mdeium">{hotel.name}</h2>
//           <h2 className="text-xs text-gray-500">📍 {hotel.address}</h2>
//           <h2 className="text-sm ">💰 {hotel.price} per night</h2>
//           <h2 className="text-sm ">⭐ {hotel.rating} stars</h2>
//         </div>
//       </div>
//     </Link>
//   );
// }


import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GetPlaceDetails, PHOTO_REF_URL } from '../services/GlobalApi'

export default function HoletCardItem({hotel}) {

    
  const [photoUrl, setPhotoUrl]=useState()
    useEffect(() => {
    hotel&&GetPlacePhoto();
    
}, [hotel]);

const GetPlacePhoto = async () => {
 const data = {
  textQuery:hotel.name
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
            encodeURIComponent(hotel?.name,hotel?.address)
        }
        target="_blank"
    >
            <div   className='hover:scale-105 transition-all cursor-pointer' >
                <img src={photoUrl?photoUrl:'https://aitrip.tubeguruji.com/placeholder.jpg' } className='rounded-xl h-[180px] w-full object-cover'  />
                <div className='my-2'>
                    <h2 className='font-mdeium'>{hotel.name}</h2>
                    <h2 className='text-xs text-gray-500'>📍 {hotel.address}</h2>
                    <h2 className='text-sm '>💰 {hotel.pricePerNight} per night</h2>
                    <h2 className='text-sm '>⭐ {hotel.rating} stars</h2>
                </div>
            </div>
            </Link>
  )
}