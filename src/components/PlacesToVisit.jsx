import React from "react";
import PlaceCardItem from "./PlaceCardItem";

export default function PlacesToVisit({ trip }) {
  if (!trip?.tripData?.dailyItinerary) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="font-bold text-lg">Places to visit</h2>
      <div>
        {trip?.tripData?.dailyItinerary.map((item, index) => (
          <div key={index}>
            <h2 className="font-medium text-lg">{item.day}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {item?.activities.map((place, index) => (
                <div key={index}>
                  <div className="my-3">
                    <PlaceCardItem place={place} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
