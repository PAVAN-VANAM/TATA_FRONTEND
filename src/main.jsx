import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Login from './components/login';
// import Classes from './components/classes';
import Attendance from './components/attendance';
import Dashboard from './components/dashboard';
import Classes from './components/classes';
import AttendanceGraph from './components/attendancegraph';


const r=createBrowserRouter([
  {
    path: "/",
    element: <Login/>,
  },
  {
    path:"/classes",
    element:<Classes/>
  },
  {
    path: "/dashboard",
    element: <Dashboard/>
  },
  {
    path:'/attendance/',
    element:<Attendance/>
  },
])
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={r} />
  </React.StrictMode>,
)

