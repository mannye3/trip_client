import React, { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import {
  SelectBudgetOptions,
  SelectTravelaList,
  ActivityOptions,
  AI_PROMPT,
} from "../constants/options";
import { chatSession } from "../services/AIModel";
import { Dialog } from "@headlessui/react";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import opencage from "opencage-api-client";

export default function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFormData] = useState([]);
  const [durationError, setDurationError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  const handleInputChange = (name, value) => {
    if (name === "noOfDays" && value > 5) {
      console.log("please enter Trip days less than 5");
      return;
    }
    if (name === "activities") {
      // Handle activities as an array
      setFormData((prev) => {
        const currentActivities = prev.activities || [];
        if (currentActivities.includes(value)) {
          // Remove activity if already selected
          return {
            ...prev,
            activities: currentActivities.filter(
              (activity) => activity !== value
            ),
          };
        } else {
          // Add new activity
          return {
            ...prev,
            activities: [...currentActivities, value],
          };
        }
      });
    } else {
      // Handle other form fields normally
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      // Create user object with necessary details
      const user = {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      };

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(user));

      onGenerateTrip();
      setOpenDialog(true);
    } catch (error) {
      console.log("could not sign in with google", error);
    }
  };

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);

      return;
    }

    try {
      setOpenDialog(false);
      setIsLoading(true);

      const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData?.location)
        .replace("{totalDays}", formData?.noOfDays)
        .replace("{activities}", formData?.activities?.join(", "))
        .replace("{traveler}", formData?.traveler)
        .replace("{budget}", formData?.budget)
        .replace("{totalDays}", formData?.noOfDays);

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const tripResponse = await result?.response?.text();

      if (!tripResponse) {
        throw new Error("No response received from AI");
      }

      const tripId = await saveTrips(tripResponse);
      console.log(tripResponse);
      if (!tripId) {
        throw new Error("Failed to save trip");
      }

      //  navigate(`/view-trip/${tripId}`);
    } catch (error) {
      // console.error("Error generating trip:", error);
      // alert(`Error generating trip: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // const saveTrips = async (tripData) => {
  //   try {
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user?.email) {
  //       throw new Error("User not authenticated");
  //     }

  //     const docId = `${Date.now()}`; // Adding prefix for better organization

  //     let parsedTripData;
  //     try {
  //       parsedTripData = JSON.parse(tripData);
  //       console.log(parsedTripData);
  //     } catch (error) {
  //       console.error("Error parsing trip data:", error);
  //       parsedTripData = tripData; // Use unparsed data if JSON parsing fails
  //     }

  //     const tripDoc = {
  //       userSelections: {
  //         location: formData.location || "",
  //         noOfDays: formData.noOfDays || "",
  //         budget: formData.budget || "",
  //         traveler: formData.traveler || "",
  //         activities: formData.activities || "",
  //       },
  //       tripData: parsedTripData,
  //       userEmail: user.email,
  //       id: docId,
  //       createdAt: new Date().toISOString(),
  //       status: "active",
  //     };

  //     const docRef = doc(db, "AITrips", docId);
  //     await setDoc(docRef, tripDoc);
  //     console.log("Document written with ID: ", docId);
  //     return docId;
  //   } catch (error) {
  //     console.error("Error saving trip:", error);
  //     throw error;
  //   }
  // };

  const saveTrips = async (tripData) => {
    try {
      // Get user details from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      // Parse tripData safely
      let parsedTripData;
      try {
        parsedTripData = JSON.parse(tripData);
        console.log("Parsed trip data:", parsedTripData);
      } catch (error) {
        console.error("Error parsing trip data:", error);
        parsedTripData = tripData; // Use raw tripData if JSON parsing fails
      }

      // Create the trip document to send to the backend
      const tripDoc = {
        userSelections: {
          location: formData.location || "",
          noOfDays: formData.noOfDays || "",
          budget: formData.budget || "",
          traveler: formData.traveler || "",
          activities: formData.activities || "",
        },
        tripData: parsedTripData,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        status: "active",
      };

      // Call the backend API to save the trip
      const response = await fetch(
        "https://trip-backend-jdfp.onrender.com/api/trips/create-trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Include user token if required
          },
          body: JSON.stringify(tripDoc),
        }
      );

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error saving trip: ${errorData.message || response.statusText}`
        );
      }

      const savedTrip = await response.json();

      // Debugging logs
      console.log("Response status:", response.status);
      console.log("Saved trip response:", savedTrip?.id);

      navigate(`/view-trip/${savedTrip?.id}`);
      // Return the trip ID (assuming the backend sends it in _id field)
      console.log("Trip saved successfully with ID:", savedTrip._id);
      return savedTrip._id;
    } catch (error) {
      console.error("Error saving trip:", error);
      throw error; // Re-throw the error to allow callers to handle it
    }
  };

  // Example usage

  // const saveTrips = async (tripData) => {
  //   try {
  //     // Retrieve user data from localStorage
  //     const user = JSON.parse(localStorage.getItem("user"));
  //     if (!user?.email) {
  //       throw new Error("User not authenticated");
  //     }

  //     // Generate a document ID if not provided
  //     const docId = tripData.id || `${Date.now()}`;

  //     // Prepare the trip document
  //     const tripDoc = {
  //       ...tripData,
  //       id: docId,
  //       userEmail: user.email,
  //       createdAt: new Date().toISOString(),
  //       status: tripData.status || "active", // Default to "active" if status is not provided
  //     };

  //     console.log("Prepared Trip Data:", tripDoc); // Debugging output

  //     // Make API call to save trip
  //     const response = await fetch("http://localhost:3000/api/trips/create-trips", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(tripDoc),
  //     });

  //     // Check if the response was successful
  //     if (!response.ok) {
  //       const errorResponse = await response.json();
  //       console.error("API Error Response:", errorResponse);
  //       throw new Error(`Failed to save trip: ${response.statusText}`);
  //     }

  //     // Parse and return the API response
  //     const result = await response.json();
  //     console.log("Trip saved successfully with ID:", result.id);
  //     return result.id;
  //   } catch (error) {
  //     // Log error details for debugging
  //     console.error("Error saving trip:", error.message);
  //     console.error("Stack Trace:", error.stack);
  //     throw error; // Rethrow to handle it elsewhere
  //   }
  // };

  const isFormValid = () => {
    return (
      formData.location &&
      formData.noOfDays &&
      formData.budget &&
      formData.traveler
      //formData.activities?.length > 0
    );
  };

  const handleLocationSearch = async (searchText) => {
    try {
      const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;

      if (searchText.length > 2) {
        const response = await opencage.geocode({
          q: searchText,
          key: apiKey,
          limit: 5,
        });

        const suggestions = response.results.map((result) => ({
          label: result.formatted,
          value: result.formatted,
          coordinates: {
            lat: result.geometry.lat,
            lng: result.geometry.lng,
          },
        }));

        setLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">
      <h2 className="font-bold text-3xl">Tell us travel preference 🏕️🏝️ </h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide some basic information, and our tri
      </p>

      <div>
        <div className="mt-20 flex flex-col gap-10">
          <h2 className="text-xl my-3 font-medium">
            What is destination of choice?
            <div className="relative">
              <input
                type="text"
                id="location"
                placeholder="Type your location here"
                name="location"
                value={locationInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocationInput(value);
                  handleLocationSearch(value);
                }}
                className="block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg">
                  {locationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setLocationInput(suggestion.label);
                        handleInputChange("location", suggestion.label);
                        setLocationSuggestions([]);
                      }}
                    >
                      {suggestion.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </h2>
        </div>
        <div>
          <div className="mt-4 ">
            <h2 className="text-xl my-3 font-medium ">
              How many days are you planing your tripe
            </h2>
            <input
              type="number"
              id="duration"
              placeholder="Ex.3"
              max="5"
              min="1"
              name="duration"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 5) {
                  setDurationError("");
                  handleInputChange("noOfDays", value);
                } else {
                  setDurationError("Please enter a number between 1 and 5");
                  handleInputChange("noOfDays", "");
                }
              }}
              className={`block w-full px-3 py-2 text-gray-700 border ${
                durationError ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {durationError && (
              <p className="text-red-500 text-sm mt-1">{durationError}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium ">What is your budget?</h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => handleInputChange("budget", item.title)}
                  className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg 
                    ${
                      formData.budget === item.title && "border-black shadow-lg"
                    }
                  >`}
                >
                  <h2 className="text-4xl">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <h2 className="text-sm text-gray-500">{item.desc}</h2>
                </div>
              );
            })}
          </div>
        </div>

        <br />
        <br />
        <div>
          <h2 className="text-xl my-3 font-medium ">
            Who do you plan to travel with on your next adventure?
          </h2>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectTravelaList.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => handleInputChange("traveler", item.people)}
                  className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg 
                    ${
                      formData.traveler === item.people &&
                      "border-black shadow-lg"
                    }
                  >`}
                >
                  <h2 className="text-4xl">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <h2 className="text-sm text-gray-500">{item.desc}</h2>
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="text-xl my-3 font-medium ">
              What activities interest you the most?
            </h2>

            <div className="grid grid-cols-3 gap-5 mt-5">
              {ActivityOptions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("activities", item.title)}
                  className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg 
          ${
            formData.activities?.includes(item.title) &&
            "border-black shadow-lg"
          }
        `}
                >
                  <h2 className="text-4xl">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <h2 className="text-sm text-gray-500">{item.desc}</h2>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        type="submit"
        onClick={onGenerateTrip}
        disabled={!isFormValid() || isLoading}
        className={`flex items-center justify-center gap-2 bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 ml-auto ${
          isLoading || !isFormValid() ? "disabled:opacity-80" : ""
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Generating...</span>
          </>
        ) : (
          "Generate Trip"
        )}
      </button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="relative z-5"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-xl font-medium mb-4">
              <img src="/logo.svg" />
            </Dialog.Title>

            <p>Sign in to the App with Google authentication securely </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleGoogleClick}
                className="w-full px-4 py-3 rounded-md text-white bg-slate-700 hover:opacity-95 disabled:opacity-80"
              >
                Sign in with Google
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
