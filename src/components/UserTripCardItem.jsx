import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPlaceDetails, PHOTO_REF_URL } from "../services/GlobalApi";

export default function UserTripCardItem({ trip }) {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    console.log("Trip data received:", trip);
    if (trip) GetPlacePhoto();
  }, [trip]);

  const GetPlacePhoto = async () => {
    try {
      const data = {
        textQuery: trip?.userSelections?.location,
      };
      console.log("Fetching photo for location:", data.textQuery);
      const result = await GetPlaceDetails(data);
      console.log("API result:", result);

      const photoName = result?.data?.places?.[0]?.photos?.[3]?.name;
      if (photoName) {
        const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);
        console.log("Setting photo URL:", photoUrl);
        setPhotoUrl(photoUrl);
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
    }
  };

  console.log("Rendering with photoUrl:", photoUrl);

  if (!trip) {
    console.log("No trip data, returning null");
    return null;
  }

  return (
    <Link to={`/view-trip/${trip._id}`} className="block">
      <div className="hover:scale-105 transition-all duration-300 bg-white p-3 rounded-xl shadow-md">
        <img
          src={
            photoUrl ||
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e"
          }
          className="rounded-xl h-[180px] w-full object-cover"
          alt={trip?.userSelections?.location || "Trip"}
          onError={(e) => {
            console.log("Image failed to load");
            e.target.src =
              "https://images.unsplash.com/photo-1469474968028-56623f02e42e";
          }}
        />
        <div className="mt-3">
          <h2 className="font-bold text-lg">
            {trip?.userSelections?.location || "Unknown Location"}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <h2 className="text-sm text-gray-500">
              {trip?.userSelections?.noOfDays || "0"} Days
            </h2>
            <span className="text-sm text-gray-500">•</span>
            <h2 className="text-sm text-gray-500">
              {trip?.userSelections?.budget || "Unknown"} Budget
            </h2>
          </div>
        </div>
      </div>
    </Link>
  );
}
