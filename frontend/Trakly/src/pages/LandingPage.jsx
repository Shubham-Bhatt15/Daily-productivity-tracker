import React from "react";
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 via-white to-teal-100 text-[#1A1A1A] px-4">
      
      <img
        src={logo}
        alt="Trakly Logo"
        className="w-32 h-32 mb-6 rounded-full shadow-xl transform transition duration-700 hover:scale-105 hover:rotate-1"
      />

      <h1 className="text-4xl font-extrabold text-[#3F51B5] mb-2 drop-shadow-sm text-center">
        Welcome to <span className="text-[#303F9F]">Trakly</span>
      </h1>

      <p className="text-lg text-gray-700 font-medium mb-8 text-center">
        Track your day, own your productivity.
      </p>

      <div className="flex gap-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-[#3F51B5] hover:bg-[#303F9F] text-white rounded-lg shadow-md transition duration-300">
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-2 bg-[#009688] hover:bg-[#00796B] text-white rounded-lg shadow-md transition duration-300">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
