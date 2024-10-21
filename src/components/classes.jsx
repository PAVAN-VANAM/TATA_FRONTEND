


// const Classes = () => {
//   const navigate = useNavigate();

//   // Retrieve batch names from localStorage (assuming batchNames are stored as an array)
//   const batchNames = JSON.parse(localStorage.getItem("batchNames")) || [];

//   const handleNavigation = (batchName) => {
//     // Navigate to the Attendance page and pass the batchName as state
//     navigate("/attendance", { state: { batchName } });
//   };

//   return (
//     <>
//        <Navbar title="Classes" showBackButton={false} />
//       <div className="p-8 w-full h-full ">
//         <h1 className="text-2xl text-gray-800 font-bold mb-4">Classes</h1>
//         <div className="grid-cols-2">
//           {batchNames.length > 0 ? (
//             batchNames.map((batchName, index) => (
//               <button
//                 key={index}
//                 className="relative h-24 gap-6 justify-between p-4 m-11 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                 onClick={() => handleNavigation(batchName)}
//               >
//                 {batchName.toUpperCase()}
//               </button>
//             ))
//           ) : (
//             <p>No batch names available</p>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Classes;


// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "./navbar";

// const Classes = () => {
//   const [selectedBatch, setSelectedBatch] = useState(""); // State to manage the selected batch
//   const navigate = useNavigate();

//   // Retrieve batch names from localStorage (assuming batchNames are stored as an array)
//   const batchNames = JSON.parse(localStorage.getItem("batchNames")) || [];

//   const handleNavigation = () => {
//     if (selectedBatch) {
//       // Navigate to the Attendance page and pass the selectedBatch as state
//       navigate("/attendance", { state: { batchName: selectedBatch } });
//     } else {
//       alert("Please select a batch.");
//     }
//   };

//   return (
//     <>
//       <Navbar title="Classes" showBackButton={false} />
//       <div className="p-8 w-full h-full flex flex-col items-center">
//         <h1 className="text-2xl text-gray-800 font-bold mb-4">Select Your Class</h1>

//         <div className="w-full md:w-1/3 mb-6">
//           {batchNames.length > 0 ? (
//             <select
//               value={selectedBatch}
//               onChange={(e) => setSelectedBatch(e.target.value)}
//               className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
//             >
//               <option value="" disabled>Select a Batch</option>
//               {batchNames.map((batchName, index) => (
//                 <option key={index} value={batchName}>
//                   {batchName.toUpperCase()}
//                 </option>
//               ))}
//             </select>
//           ) : (
//             <p>No batch names available</p>
//           )}
//         </div>

//         <button
//           onClick={handleNavigation}
//           className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 transition duration-200"
//         >
//           Enter
//         </button>
//       </div>
//     </>
//   );
// };

// export default Classes;

import {  useNavigate } from "react-router-dom";
import Navbar from "./navbar";

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function BatchSelection() {
  const navigate = useNavigate();

  //  Retrieve batch names from localStorage (assuming batchNames are stored as an array)
  const batchNames = JSON.parse(localStorage.getItem("batchNames")) || [];

 
  const [batchName, setbatchName] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const batches = JSON.parse(localStorage.getItem("batchNames")) || [];

  const handleEnroll = () => {
    if (batchName) {
      alert(`You've enrolled in ${batchName}!`);
        // Navigate to the Attendance page and pass the batchName as state
        navigate("/attendance", { state: {batchName } });
      // Here you would typically handle the enrollment process, 
      // such as making an API call or updating the application state
    } else {
      alert('Please select a batch before enrolling.')
    }
  }

  return (
    <>
    <Navbar title="Classes" showBackButton={false} />
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Enroll in a Batch</h2>
      <div className="relative mb-4">
        <div
          className="w-full p-3 text-left bg-gray-100 rounded-md cursor-pointer flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={batchName ? 'text-gray-800' : 'text-gray-500'}>
            {batchName || 'Select a batch'}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' :[]}`} />
        </div>
        {isOpen && (
          <motion.ul
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {batches.map((batch, index) => (
              <motion.li
                key={index}
                className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => {
                  setbatchName(batch)
                  setIsOpen(false)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {batch}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
      <motion.button
        className={`w-full p-3 rounded-md text-white font-semibold transition-colors ${
          batchName ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleEnroll}
        whileHover={batchName ? { scale: 1.02 } : {}}
        whileTap={batchName ? { scale: 0.98 } : {}}
        disabled={!batchName}
      >
        Enroll Now
      </motion.button>
    </div>
    </>
  )
}
