"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../config/supabaseClient";
import { Toaster, toast } from "react-hot-toast"; // Correct import for react-hot-toast

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lockoutTime, setLockoutTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // On page load, clear session-specific information and check for lockout timestamp
  useEffect(() => {
    // Clear only specific session storage keys
    sessionStorage.removeItem("developer_id");
    sessionStorage.removeItem("developer_email");

    // Retrieve the lockout timestamp from localStorage
    const lockoutTimestamp = localStorage.getItem("lockout_timestamp");
    if (lockoutTimestamp) {
      const now = new Date().getTime();
      const timeLeft = Math.ceil((lockoutTimestamp - now) / 1000);
      if (timeLeft > 0) {
        setLockoutTime(lockoutTimestamp);
        setTimeRemaining(timeLeft);
      } else {
        // If lockout has expired, remove it from localStorage
        localStorage.removeItem("lockout_timestamp");
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = Math.ceil((lockoutTime - now) / 1000);
        if (timeLeft <= 0) {
          clearInterval(interval);
          setLockoutTime(null);
          setTimeRemaining(0);
          localStorage.removeItem("lockout_timestamp");
          localStorage.setItem("failed_attempts", 0); // Reset failed attempts after lockout ends
        } else {
          setTimeRemaining(timeLeft);
        }
      }, 1000);

      // Clean up the interval when the component is unmounted or lockoutTime changes
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutTime) {
      toast.error(`Please wait ${timeRemaining} seconds before trying again.`);
      return;
    }

    try {
      // Call the stored procedure in Supabase to check user login
      const { data, error } = await supabase.rpc("check_user_login2", {
        user_email: email,
        user_password: password,
      });

      if (error) {
        console.error("Error querying Supabase:", error);
        toast.error("An error occurred. Please try again.");
        return;
      }

      if (data && data.length > 0) {
        // Login successful
        const developerId = data[0].developer_id;
        sessionStorage.setItem("developer_id", developerId);
        sessionStorage.setItem("developer_email", email);
        localStorage.setItem("failed_attempts", 0); // Reset failed attempts on successful login
        router.push("/home_dev"); // Navigate to the home page
      } else {
        // Login failed
        handleFailedLoginAttempt();
      }
    } catch (err) {
      console.error("Error during login:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleFailedLoginAttempt = () => {
    let failedAttempts = parseInt(localStorage.getItem("failed_attempts")) || 0;
    failedAttempts += 1;
    localStorage.setItem("failed_attempts", failedAttempts);

    if (failedAttempts >= 3) {
      const lockoutDuration = 30 * 1000; // 30 seconds in milliseconds
      const lockoutTimestamp = new Date().getTime() + lockoutDuration;
      localStorage.setItem("lockout_timestamp", lockoutTimestamp);
      setLockoutTime(lockoutTimestamp);
      setTimeRemaining(30);
      toast.error("Too many failed attempts. Please try again in 30 seconds.");
    } else {
      toast.error("Incorrect email or password. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Toaster position="top-center" reverseOrder={false} /> {/* Toaster for notifications */}

      {/* Back Button */}
      <button 
        onClick={() => router.push('/landing')} 
        className="absolute top-10 left-4 flex items-center justify-center w-12 h-12 rounded-lg border border-gray-200 shadow-sm text-black"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center mb-8 mt-10">
        <div className="rounded-full w-80 h-80 flex justify-center items-center">
          <img
            src="/images/Brand.png"
            alt="Parking Icon"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            required
            disabled={!!lockoutTime} // Disable input if locked out
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            required
            disabled={!!lockoutTime} // Disable input if locked out
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gray-800 text-white py-3 rounded-md text-lg hover:bg-gray-600 mb-36"
          disabled={!!lockoutTime} // Disable button if locked out
        >
          {lockoutTime ? `Please wait ${timeRemaining} seconds` : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;