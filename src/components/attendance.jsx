// import { useState, useEffect, useRef, useCallback } from "react";
// import QRCode from "qrcode";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import Navbar from "./navbar";

// const Attendance = () => {
//   const [, setToken] = useState("");
//   const [timer, setTimer] = useState(10);
//   const [isQrVisible, setIsQrVisible] = useState(false);
//   const [isRegenerating, setIsRegenerating] = useState(false);
//   const qrCanvasRef = useRef(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const batchName = location.state?.batchName || "Unknown Batch";

//   const fetchToken = useCallback(async () => {
//     try {
//       const response = await axios.put(`${import.meta.env.VITE_API}/batch/generate`, {
//         batch_name: batchName,
//       });

//       if (response.data && response.data.updatedBatch) {
//         const newToken = response.data.updatedBatch.token;
//         setToken(newToken); // Update the state with the new token
//         localStorage.setItem("token", newToken); // Store the token in local storage
//         return newToken; // Return the new token directly
//       } else {
//         console.error("Token not found in response:", response);
//       }
//     } catch (error) {
//       console.error("Error fetching token:", error);
//     }
//     return null;
//   }, [batchName]);

//   const generateQrCode = useCallback((tokenToUse) => {
//     const canvas = qrCanvasRef.current;
//     if (!tokenToUse) {
//       console.warn("Token is not available yet!");
//       return;
//     }

//     QRCode.toCanvas(canvas, tokenToUse, { width: 512  , scale:0 ,errorCorrectionLevel: 'H'}, (error) => {
//       if (error) console.error("Error generating QR Code:", error);
//     });
//   }, []);

//   const refreshQrCode = useCallback(async () => {
//     localStorage.removeItem("token");
//     const newToken = await fetchToken();
//     if (newToken) {
//       generateQrCode(newToken); // Use the new token directly
//     }
//   }, [fetchToken, generateQrCode]);

//   useEffect(() => {
//     let countdown;
//     if (isQrVisible) {
//       refreshQrCode(); // Generate the QR code when visibility is turned on

//       countdown = setInterval(() => {
//         setTimer((prevTimer) => {
//           if (prevTimer === 1) {
//             setIsRegenerating(true);

//             setTimeout(async () => {
//               await refreshQrCode(); // Refresh the QR code every 10 seconds
//               setIsRegenerating(false);
//               setTimer(10); // Reset the timer to 10
//             }, 1000);

//             return 10;
//           }
//           return prevTimer - 1;
//         });
//       }, 1000);
//     }

//     return () => {
//       clearInterval(countdown);
//     };
//   }, [isQrVisible, refreshQrCode]);

//   const handleToggleAttendance = () => {
//     setIsQrVisible((prev) => !prev);
//     if (!isQrVisible) {
//       setTimer(10);
//     }
//   };

//   const goToDashboard = () => {
//     navigate("/dashboard", { state: { batchName } });
//   };

//   return (
//     <>
//       <Navbar title={`Attendance - ${batchName}`} showBackButton={true} />
//       <button
//         onClick={goToDashboard}
//         className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
//       >
//         Go to Dashboard
//       </button>
//       <div className="p-10 flex flex-col justify-center items-center">
//         <button
//           onClick={handleToggleAttendance}
//           className="bg-blue-600 text-gray-200 py-2 px-4 rounded-md"
//         >
//           {isQrVisible ? "Stop Attendance" : `Mark Attendance for ${batchName}`}
//         </button>

//         {isQrVisible && (
//           <div className="mt-10">
//             <div>
//               <canvas ref={qrCanvasRef} />
//             </div>
//             <p className="mt-4 text-lg text-red-600">
//               {isRegenerating ? "Regenerating QR..." : `QR code will refresh in ${timer} seconds`}
//             </p>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default Attendance;


import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code"; // Import QRCode from react-qr-code
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./navbar";

const Attendance = () => {
  const [, setToken] = useState("");
  const [timer, setTimer] = useState(10);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [qrToken, setQrToken] = useState(null); // State to store the token for the QR code

  const navigate = useNavigate();
  const location = useLocation();
  const batchName = location.state?.batchName || "Unknown Batch";

  const fetchToken = useCallback(async () => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API}/batch/generate`, {
        batch_name: batchName,
      });

      if (response.data && response.data.updatedBatch) {
        const newToken = response.data.updatedBatch.token;
        setToken(newToken); // Update the state with the new token
        localStorage.setItem("token", newToken); // Store the token in local storage
        return newToken; // Return the new token directly
      } else {
        console.error("Token not found in response:", response);
      }
    } catch (error) {
      console.error("Error fetching token:", error);
    }
    return null;
  }, [batchName]);

  const refreshQrCode = useCallback(async () => {
    localStorage.removeItem("token");
    const newToken = await fetchToken();
    if (newToken) {
      setQrToken(newToken); // Use the new token directly for the QR code
    }
  }, [fetchToken]);

  useEffect(() => {
    let countdown;
    if (isQrVisible) {
      refreshQrCode(); // Generate the QR code when visibility is turned on

      countdown = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            setIsRegenerating(true);

            setTimeout(async () => {
              await refreshQrCode(); // Refresh the QR code every 10 seconds
              setIsRegenerating(false);
              setTimer(10); // Reset the timer to 10
            }, 1000);

            return 10;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(countdown);
    };
  }, [isQrVisible, refreshQrCode]);

  const handleToggleAttendance = () => {
    setIsQrVisible((prev) => !prev);
    if (!isQrVisible) {
      setTimer(10);
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard", { state: { batchName } });
  };

  return (
    <>
      <Navbar title={`Attendance - ${batchName}`} showBackButton={true} />
      <button
        onClick={goToDashboard}
        className="mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700"
      >
        Go to Dashboard
      </button>
      <div className="p-10 flex flex-col justify-center items-center">
        <button
          onClick={handleToggleAttendance}
          className="bg-blue-600 text-gray-200 py-2 px-4 rounded-md"
        >
          {isQrVisible ? "Stop Attendance" : `Mark Attendance for ${batchName}`}
        </button>

        {isQrVisible && (
          <div className="mt-10">
            {qrToken && (
              <QRCode
                value={qrToken} // The token for the QR code
                size={512} // Size of the QR code, adjust as needed
                level="L" // Error correction level (H for highest level)
              />
            )}
            <p className="mt-4 text-lg text-red-600">
              {isRegenerating ? "Regenerating QR..." : `QR code will refresh in ${timer} seconds`}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Attendance;
