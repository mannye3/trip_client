import React from "react";

export default function AdditionalInformation({ trip }) {
  const estimatedCosts = trip?.tripData?.estimatedCosts;

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Additional Information</h2>
          <div className="mt-4">
            {estimatedCosts ? (
              <>
                {/* Transportation Section */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Transportation Costs</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    {Object.entries(estimatedCosts.transportation).map(
                      ([key, value], index) => (
                        <li key={index} className="capitalize">
                          <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {value}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Dining Section */}
                <div>
                  <h3 className="font-semibold text-lg">Dining Costs</h3>
                  <ul className="list-disc pl-5 text-gray-600">
                    {Object.entries(estimatedCosts.dining).map(
                      ([key, value], index) => (
                        <li key={index} className="capitalize">
                          <strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {value}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No estimated costs available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
