import  { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../ace_logo.png';

// MUI Components
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Login = () => {
  const [userId, setuserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false); // To control the Snackbar

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    const API_URL = `${import.meta.env.VITE_API}/profile/login`;
    const loginData = { userId, password };

    try {
      const response = await axios.post(API_URL, loginData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      if (response.status === 200) {
        localStorage.setItem("userId", data.user.userId);
        localStorage.setItem("batchNames",  JSON.stringify(data.user.batchNames));
        setSuccessMessage("Login successful!");
        setOpenSnackbar(true); // Open success Snackbar
        setTimeout(() => {
          navigate("/classes"); // Navigate to attendance after login
        }, 2000); // Delay navigation to allow Snackbar to display
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response) {
        setError(error.response.data?.message || "Login failed !");
      } else {
        setError("Unexpected Error!!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#D6E6F2]">
      <img src={Logo} alt="" className="w-[250px]" />
      <br />
      <div className="bg-white p-4 rounded-lg shadow-md w-[80%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setuserId(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* MUI Snackbar and Alert */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
