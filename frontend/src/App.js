import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from "./components/Dashboard/Dashboard";
import WorkoutDetail from "./components/WorkoutDetail/WorkoutDetail";

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;