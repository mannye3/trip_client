import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// import { doc, getDoc } from "firebase/firestore";
// import { app, db } from "../firebase";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import PlacesToVisit from "../components/PlacesToVisit";
import AdditionalInformation from "./../components/AdditionalInformation";
import GeneralInformation from "./../components/GeneralInformation";



function ViewTrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState([]);

  useEffect(() => {
    tripId && GetTripData();
  }, [tripId]);

const GetTripData = async () => {
  console.log("Fetching trip with ID:", tripId); // Debugging log

  try {
    const response = await fetch(`https://trip-backend-jdfp.onrender.com/api/trips/trips/${tripId}`); // Ensure tripId is defined
    if (!response.ok) {
      throw new Error("Trip not found");
    }

    const data = await response.json();
    console.log("Fetched trip data:", data);
    setTrip(data);
  } catch (error) {
    console.error("Error fetching trip:", error);
    alert("Failed to load trip");
  }
};




  return (
    <div className="p-10 md:px-20 lg:px-44 xl:px-56">
      <InfoSection trip={trip} />
      <Hotels trip={trip} />
       <GeneralInformation trip={trip} />
      <AdditionalInformation trip={trip} />
      <PlacesToVisit trip={trip} />
    </div>
  );
}

export default ViewTrip;
