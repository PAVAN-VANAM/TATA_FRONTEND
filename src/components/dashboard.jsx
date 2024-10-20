/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "./navbar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress"; // For loading animation
import { Box, Grid, Typography, Paper } from "@mui/material"; // Import Material-UI components
// import { useNavigate } from "react-router-dom;s

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [fetch, setFetch] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const location = useLocation();
  const batchName = location.state?.batchName || "Unknown Batch";
  const [changedStudents, setChangedStudents] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [departments, setDepartments] = useState([]); // List of departments from backend
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("All"); // Present, Absent, or All

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API}/profile/view`,
          {
            batch_name: batchName,
          }
        );
        const allAttendanceRecords = response.data;

        const formattedStudents = allAttendanceRecords.map((record, index) => ({
          id: index + 1,
          userId: record.userId,
          name: record.name,
          department: record.department,
          present: record.attendance.length > 0 ? "Present" : "Absent",
        }));
        setStudents(formattedStudents);
      } catch (error) {
        console.error("Error fetching attendance data:", error.message);
        setErrorMessage("Failed to fetch attendance data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API}/departments`
        ); // Adjust this endpoint as needed
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error.message);
      }
    };

    fetchAttendanceData();
    fetchDepartments();
  }, [fetch]);

  // Filter students based on search, department, and attendance status
  const filteredStudents = students.filter((student) => {
    const matchesSearchText =
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.userId.toLowerCase().includes(searchText.toLowerCase());

    const matchesDepartment = selectedDepartment
      ? student.department === selectedDepartment
      : true;

    const matchesAttendanceStatus =
      attendanceStatus === "All" || student.present === attendanceStatus;

    return matchesSearchText && matchesDepartment && matchesAttendanceStatus;
  });

  const toggleAttendance = (student) => {
    const updatedUser = {
      ...student,
      present: student.present === "Present" ? "Absent" : "Present",
    };

    // Optimistically update the attendance status
    setStudents((prevStudents) =>
      prevStudents.map((s) => (s.id === student.id ? updatedUser : s))
    );

    // Add or update the student in the changedStudents list
    setChangedStudents((prevChanges) => {
      const alreadyChanged = prevChanges.find((s) => s.id === student.id);
      if (alreadyChanged) {
        // If the student is already in the list, update the entry
        return prevChanges.map((s) => (s.id === student.id ? updatedUser : s));
      } else {
        // Otherwise, add the student to the list
        return [...prevChanges, updatedUser];
      }
    });
  };

  const updateAllAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API}/attendance/update`,
        {
          students: changedStudents,
          batch_name: batchName,
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Attendance updated successfully for all students");
        setOpenSnackbar(true);
        reload();
        setChangedStudents([]);
      } else {
        setErrorMessage("Failed to update attendance for all students.");
      }
    } catch (error) {
      setErrorMessage("Failed to update attendance for all students.");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

// Count present and absent students
  const presentCount = filteredStudents.filter(
    (student) => student.present === "Present"
  ).length;
  const absentCount = filteredStudents.length - presentCount;

  // for downloading excel. 
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    worksheet["E1"].v = formattedDate;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Present Students");
    const timestamp = new Date().toISOString().replace(/[:.-]/g, "_");
    XLSX.writeFile(workbook, `Present_Students_${batchName}_${timestamp}.xlsx`);
  };

  const reload = () => {
    setFetch(!fetch);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${day}-${month}-${year}`;
  console.log(formattedDate);


  return (
    <>
      <Navbar
        title={`Attendance - ${batchName.toUpperCase()}`}
        showBackButton={true}
      />
      <div className={`p-10 transition ${isOpen ? "blur-sm" : ""}`}>
        <h1 className="text-2xl font-bold mb-5">
          {batchName.toUpperCase()} Attendance Dashboard
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name or user ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border p-2 rounded m-2 w-full"
        />
        {/* console.log(department); */}

        {/* Department Filter */}
        <select
          value={selectedDepartment} // Correctly bound to selectedDepartment
          onChange={(e) => setSelectedDepartment(e.target.value)} // Correctly updating selectedDepartment
          className="p-2 border border-gray-400 rounded-md"
        >
          <option value="">All Departments</option>
          {/* Map all distinct departments */}
          {Array.from(
            new Set(students.map((student) => student.department))
          ).map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Attendance Status Filter */}
        <select
          value={attendanceStatus}
          onChange={(e) => setAttendanceStatus(e.target.value)}
          className="border p-2 rounded m-2"
        >
          <option value="All">All Attendance</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>

        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white py-2 px-4 m-2 rounded-md mb-5 hover:bg-green-700"
        >
          Download as Excel
        </button>

        <button
          onClick={reload}
          className="bg-yellow-300 text-black py-2 px-4 rounded-md m-5 hover:bg-yellow-600 hover:text-white"
        >
          Refresh List
        </button>

        <button
          className="bg-blue-500 text-white py-2 px-4 m-5 rounded-md hover:bg-blue-700"
          onClick={updateAllAttendance}
        >
          Update All Attendance
        </button>

        
            {/* Present/Absent Counts with Interactive Boxes */}
        <Grid container spacing={3} className="my-5">
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#e0f7fa",
                textAlign: "center",
                borderRadius: "8px",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Typography variant="h6" sx={{ color: "#00796b" }}>
                Present Students
              </Typography>
              <Typography variant="h4" sx={{ color: "#00796b", fontWeight: "bold" }}>
                {presentCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                backgroundColor: "#ffebee",
                textAlign: "center",
                borderRadius: "8px",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              <Typography variant="h6" sx={{ color: "#c62828" }}>
                Absent Students
              </Typography>
              <Typography variant="h4" sx={{ color: "#c62828", fontWeight: "bold" }}>
                {absentCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <table className="min-w-full bg-white mb-10">
          <thead>
            <tr>
              <th className="py-2">ID</th>
              <th className="py-2">User ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Department</th>
              <th className="py-2">Attendance- {formattedDate}</th>
              <th className="py-2">Toggle</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.id}>
                <td className="text-center py-2">{student.id}</td>
                <td className="text-center py-2">{student.userId}</td>
                <td className="text-center py-2">{student.name}</td>
                <td className="text-center py-2">{student.department}</td>
                <td
                  className={`text-center py-2 ${
                    student.present === "Present"
                      ? "bg-green-200"
                      : "bg-red-200"
                  } `}
                >
                  {student.present}
                </td>
                <td className="text-center py-2">
                  <button
                    className={`px-4 py-1 rounded ${
                      student.present === "Present"
                        ? "bg-red-500"
                        : "bg-green-500"
                    } text-white`}
                    onClick={() => toggleAttendance(student)}
                  >
                    {student.present === "Present"
                      ? "Mark Absent"
                      : "Mark Present"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <Stack spacing={2}>
          <Pagination
            count={Math.ceil(filteredStudents.length / studentsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>

        {/* Snackbar for success or error messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Dashboard;
