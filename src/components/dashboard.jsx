import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Pagination } from "@nextui-org/react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from "./navbar";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


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

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.post(`${import.meta.env.VITE_API}/profile/view`, {
          batch_name: batchName
        });
        const allAttendanceRecords = response.data;

        const formattedStudents = allAttendanceRecords.map((record, index) => ({
          id: index + 1,
          userId: record.userId,
          name: record.name,
          department: record.department,
          present: record.attendance.length > 0 ? "Present" : "Absent"
        }));
        setStudents(formattedStudents);
      } catch (error) {
        console.error("Error fetching attendance data:", error.message);
        setErrorMessage("Failed to fetch attendance data.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchAttendanceData();
  }, [fetch, batchName]);

  const toggleAttendance = async (student) => {
    const updatedUser = { ...student, present: student.present === "Present" ? "Absent" : "Present" };
    
    // Optimistically update the attendance status
    setStudents((prevStudents) =>
      prevStudents.map((s) => (s.id === student.id ? updatedUser : s))
    );

    // Prepare the attendance status to send to the server
    try {
      const response = await axios.put(`${import.meta.env.VITE_API}/attendance/update`, {
        userId: updatedUser.userId,
        batch_name: batchName,
        attendance: updatedUser.present==="Present" ? false: true,
      });

      if (response.status === 201) {
        setSuccessMessage("Attendance updated successfully");
        setOpenSnackbar(true); // Open success Snackbar
      } else {
        console.log("Failed to update attendance:", response.data.message);
        setStudents((prevStudents) =>
          prevStudents.map((s) => (s.id === student.id ? student : s))
        );
        setErrorMessage("Failed to update attendance.");

      }
    } catch (error) {
      console.error("Error while updating attendance:", error);
      // Revert to previous state if there's an error
      setStudents((prevStudents) =>
        prevStudents.map((s) => (s.id === student.id ? student : s))
      );
      setErrorMessage("Failed to update attendance.");
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const deleteAllStudents = async () => {
    // Close modal first to avoid any UI delays
    onOpenChange(false); 
  
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API}/attendance/delete`, {
        data: {
          batch_name: batchName // Pass the batch_name here
        }
      });
  
      // Handle successful deletion
      if (response.status === 200) {
        setStudents([]); // Clear the student list on successful deletion
        setSuccessMessage(response.data.msg); // Set success message
        setOpenSnackbar(true); // Open success Snackbar
      } else {
        console.error("Failed to delete attendance records:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting attendance records:", error);
      // Optionally handle error, e.g., show an error Snackbar
    }
  };
  

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Present Students");
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_'); // Creates a timestamp
    XLSX.writeFile(workbook, `Present_Students_${batchName}_${timestamp}.xlsx`);
  };

  const reload = () => {
    setFetch(!fetch);
  };

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(indexOfFirstStudent, indexOfLastStudent);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar title={`Attendance - ${batchName.toUpperCase()}`} showBackButton={true} />
      <div className={`p-10 transition ${isOpen ? "blur-sm" : ""}`}>
        <h1 className="text-2xl font-bold mb-5">{batchName.toUpperCase()} Attendance Dashboard</h1>

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
          onClick={onOpen}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
        >
          Delete All Students
        </button>

        <table className="min-w-full bg-white mb-5">
          <thead>
            <tr>
              <th className="py-2">Serial No</th>
              <th className="py-2">User ID</th>
              <th className="py-2">Name</th>
              <th className="py-2">Batch</th>
              <th className="py-2">Department</th>
              <th className="py-2">Attendance</th>
              <th className="py-2">Edit</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.id}>
                <td className="border px-4 py-2">{student.id}</td>
                <td className="border px-4 py-2">{student.userId}</td>
                <td className="border px-4 py-2">{student.name}</td>
                <td className="border px-4 py-2">{batchName}</td>
                <td className="border px-4 py-2">{student.department}</td>
                <td className={`${student.present=="Present"  ? "text-green-600 text-xl border px-4 py-2": "text-red-700 text-xl border px-4 py-2"}`}>{student.present}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => toggleAttendance(student)}
                    className="bg-blue-500 text-white py-1 px-2 rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination total={Math.ceil(students.length / studentsPerPage)} page={currentPage} onChange={paginate} />
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="fixed inset-0 h-[300px] flex items-center justify-center"
      >
        <ModalContent className="bg-white shadow-lg rounded-lg border p-6 max-w-lg mx-auto">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-semibold text-red-600 text-center">
                Confirm Deletion
              </ModalHeader>
              <ModalBody className="text-center">
                <p className="text-gray-600">
                  Are you sure you want to delete all students from the list?
                  This action cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter className="flex justify-center gap-3">
                <Button
                  color="danger"
                  variant="light"
                  className="w-24 py-2"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  className="w-24 py-2"
                  onPress={deleteAllStudents}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* MUI Snackbar and Alert */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={2000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dashboard;
