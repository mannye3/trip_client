import React from "react";

export default function GeneralInformation({ trip }) {
  //   console.log(trip.additionalInformation);
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">General Information </h2>
          <div className="flex gap-5">
            <h2 className="p-1 px-3 bg-gray-200  text-gray-500 text-xs md:text-md">
             
              {trip?.tripData?.locationOverview?.history ||
                trip?.tripData?.locationOverview?.briefHistory}
            </h2>

            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              Currency:{" "}
                {trip?.tripData?.additionalInformation?.currency || 
                trip?.tripData?.additionalInformation?.localCurrency || trip?.additionalInfo?.currency}
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              Timezone: {trip?.tripData?.additionalInformation?.timezone}
            </h2>
            
          </div>
        </div>
      </div>
    </div>
  );
}
