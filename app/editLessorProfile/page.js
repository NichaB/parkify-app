"use client";
import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaEdit } from "react-icons/fa";
import BottomNav from "../components/BottomNavLessor";
import BackButton from "../components/BackButton";
import { useRouter } from "next/navigation";

export default function EditLessor() {
  const router = useRouter();
  const [lessorId, setLessorId] = useState(null);
  const [lessorDetails, setLessorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [passwordEditable, setPasswordEditable] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Retrieve lessorId from sessionStorage
  useEffect(() => {
    const storedLessorId = sessionStorage.getItem("lessorId");
    if (storedLessorId) {
      setLessorId(storedLessorId);
    } else {
      toast.error("Lessor ID not found");
      router.push("/login_lessor");
    }
  }, []);

  const fieldLabels = {
    lessor_firstname: "First Name",
    lessor_lastname: "Last Name",
    lessor_phone_number: "Phone Number",
    lessor_email: "Email",
    lessor_password: "Password",
  };

  // Fetch lessor details
  const fetchLessorDetails = async () => {
    try {
      const response = await fetch(
        `/api/lessorFetchLessor?lessorId=${lessorId}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error fetching data");
      setLessorDetails(data.lessorDetails || {});
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching lessor details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessorId) {
      fetchLessorDetails();
    }
  }, [lessorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLessorDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordFieldClick = () => {
    if (!passwordEditable) {
      setShowPasswordModal(true);
      toast("Please verify your current password first", { duration: 3000 });
    }
  };

  

  const handlePasswordVerification = async () => {
    try {
      const response = await fetch('/api/lessorVerifyPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessor_id: lessorId, // Use the correct field name expected by the API
          currentPassword: currentPasswordInput,
        }),
      });
  
      // Parse the response
      let result;
      try {
        result = await response.json();
      } catch (error) {
        toast.error("Invalid response from server");
        return;
      }
  
      if (!response.ok) {
        toast.error(result.error || "Password verification failed");
        return; // Exit the function if verification fails
      }
  
      // Password verified successfully, allow password editing
      setPasswordEditable(true);
      setShowPasswordModal(false);
      toast.success("You can now edit your password");
  
      // Optional: If you need to store the decrypted password
      setRenterDetails((prev) => ({
        ...prev,
        password: result.decrypted_password, // Avoid storing unless necessary
      }));
    } catch (error) {
      console.error("Password verification error:", error);
      // Display a generic toast for unexpected issues
      toast.error("An unexpected error occurred during password verification.");
    }
  };
  
  

  const handleSave = async () => {
    const payload = {
      lessor_id: lessorId,
      ...lessorDetails,
    };

    // Include currentPassword only if password editing is enabled
    if (passwordEditable && lessorDetails.lessor_password) {
      payload.currentPassword = currentPasswordInput;
    }

    try {
      const updateResponse = await fetch(`/api/lessorFetchLessor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Update failed:", errorText);
        throw new Error(errorText || "Update failed");
      }

      toast.success("Lessor details updated successfully!");

      // Clear the password field after saving
      setLessorDetails((prev) => ({
        ...prev,
        lessor_password: "", // Clear the password field
      }));

      // Reset password-related states
      setPasswordEditable(false);
      setCurrentPasswordInput("");
    } catch (error) {
      toast.error("Error saving data");
      console.error("Save error:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white">
      <Toaster />
      <div className="relative flex-grow overflow-y-auto p-6">
        <BackButton targetPage="/setting_lessor" />
        <h1 className="text-2xl font-bold text-black text-left w-full px-6 mt-5 py-4">
          Profile Setting
        </h1>
        <div className="flex flex-col items-center mt-10">
          {Object.keys(fieldLabels).map((field) => (
            <div
              key={field}
              className="flex items-center justify-between mb-4 w-full max-w-sm bg-gray-100 p-4 rounded-lg shadow-lg"
            >
              <label className="text-sm text-gray-400 w-1/3">
                {fieldLabels[field]}
              </label>
              <input
                type={
                  field === "lessor_password" && !passwordEditable
                    ? "password"
                    : "text"
                }
                name={field}
                value={
                  field === "lessor_password" && !passwordEditable
                    ? "******"
                    : lessorDetails[field] || ""
                }
                onChange={handleChange}
                className="text-gray-800 text-right w-2/3 focus:outline-none bg-transparent"
                readOnly={field === "lessor_password" && !passwordEditable}
                onClick={() =>
                  field === "lessor_password" && handlePasswordFieldClick()
                }
              />

              <FaEdit className="ml-2 text-gray-400" />
            </div>
          ))}

          <div className="flex justify-between w-full max-w-sm mt-5 space-x-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 mb-10"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
      <BottomNav />

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">
              Enter Current Password
            </h2>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPasswordInput}
              onChange={(e) => setCurrentPasswordInput(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordVerification}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
