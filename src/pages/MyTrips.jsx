import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import UserTripCardItem from "../components/UserTripCardItem";

export default function MyTrips() {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const tripsPerPage = 9;

  useEffect(() => {
    GetUserTrips();
  }, []);

  const GetUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://trip-backend-jdfp.onrender.com/api/trips/user-trips/${user?.email}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("API Response:", {
        status: response.status,
        data: responseData,
        userEmail: user.email,
      });

      if (responseData && responseData.trips) {
        setUserTrips(responseData.trips);
        setHasMore(responseData.trips.length > tripsPerPage);
      } else {
        console.error("Unexpected API response structure:", responseData);
        setUserTrips([]);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      console.error("Error details:", {
        message: error.message,
        userEmail: user?.email,
      });
      setUserTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Calculate the trips to display based on current page
  const displayedTrips = userTrips.slice(0, page * tripsPerPage);
  const canLoadMore = displayedTrips.length < userTrips.length;

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      <h1 className="font-bold text-3xl">My Trips</h1>

      {/* Debug info */}
      <div className="text-sm text-gray-500 mt-2">
        Loading: {isLoading ? "true" : "false"}, Trips count:{" "}
        {userTrips?.length || 0}
      </div>

      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      ) : displayedTrips && displayedTrips.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {displayedTrips.map((trip, index) => (
              <UserTripCardItem key={index} trip={trip} />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-lg">No trips found</p>
        </div>
      )}
    </div>
  );
}
