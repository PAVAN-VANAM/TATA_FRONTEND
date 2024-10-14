
import {  useNavigate } from "react-router-dom";
import Navbar from "./navbar";

const Classes = () => {
  const navigate = useNavigate();

  // Retrieve batch names from localStorage (assuming batchNames are stored as an array)
  const batchNames = JSON.parse(localStorage.getItem("batchNames")) || [];

  const handleNavigation = (batchName) => {
    // Navigate to the Attendance page and pass the batchName as state
    navigate("/attendance", { state: { batchName } });
  };

  return (
    <>
       <Navbar title="Classes" showBackButton={false} />
      <div className="p-8">
        <h1 className="text-2xl text-gray-800 font-bold mb-4">Classes</h1>
        <div className="space-y-4 w-60">
          {batchNames.length > 0 ? (
            batchNames.map((batchName, index) => (
              <button
                key={index}
                className="block w-full p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={() => handleNavigation(batchName)}
              >
                {batchName.toUpperCase()}
              </button>
            ))
          ) : (
            <p>No batch names available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Classes;
