import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ title, showBackButton }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("batchNames");
    localStorage.removeItem("token");
    navigate("/"); // Redirect to login page
  };

  const handleBack = () => {
    navigate(-1); // Redirect to previous page
  };

  return (
    <nav className="bg-[#D6E6F2] p-4 text-white flex items-center">
      {showBackButton ? (
        <button
          onClick={handleBack}
          className="bg-gray-600 px-3 py-1 rounded-md hover:bg-gray-700 mr-4"
        >
          Back
        </button>
      ) : (
        <button
          onClick={handleLogout}
          className="bg-gray-600 px-3 py-1 rounded-md hover:bg-gray-700 mr-4"
        >
          Logout
        </button>
      )}
      <h1 className="text-2xl text-gray-800 font-semibold">{title}</h1>
    </nav>
  );
};

export default Navbar;
