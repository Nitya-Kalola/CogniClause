import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const History = lazy(() => import("./pages/History"));
import ContractEvaluator from "./components/ContractEvaluator";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import BackgroundLayer from "./components/BackgroundLayer";
const ContractDetails = lazy(() => import("./pages/ContractDetails"));
const About = lazy(() => import("./pages/About"));

import useSupabaseSession from "./hooks/useSupabaseSession";  // ✅ NEW

export default function App() {
  const session = useSupabaseSession();
  const user = session?.user ?? null;

  return (
    
    <div className="w-full h-full">
    <BackgroundLayer />
      

      <Navbar user={user} />  {/* pass user */}

      <div className="pt-24 w-full h-full">
       
          <Routes>
            {/* Redirect logged-in user */}
            <Route
              path="/"
              element={<Home />}
            />

          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />

          {/* Evaluation */}
          <Route path="/evaluate" element={<ContractEvaluator />} />

          {/* Auth-required routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute user={user}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contract/:id"
            element={
              <ProtectedRoute user={user}>
                <ContractDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      
          
      </div>
    </div>
  );
}
