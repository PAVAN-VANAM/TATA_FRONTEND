import React from "react";
import { useLocation } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Box } from "@mui/material";
import Navbar from "./navbar";

const AttendanceGraph = () => {
  const location = useLocation();
  const departmentSummary = location.state?.departmentSummary || [];

  const data = {
    labels: departmentSummary.map((dept) => dept.department),
    datasets: [
      {
        label: "Present",
        data: departmentSummary.map((dept) => dept.presentCount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Absent",
        data: departmentSummary.map((dept) => dept.absentCount),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Attendance Summary by Department",
      },
    },
  };

  return (
    <>
      <Navbar title="Attendance Graph" showBackButton={true} />
      <div className="p-10">
        <h1 className="text-2xl font-bold mb-5">Graphical Representation of Attendance</h1>
        {departmentSummary.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <Box sx={{ textAlign: "center" }}>No data available for the graph.</Box>
        )}
      </div>
    </>
  );
};

export default AttendanceGraph;
