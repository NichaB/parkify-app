'use client';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import supabase from '../../config/supabaseClient';


export default function RegisterInformationPage() {
  const router = useRouter();
  const email = sessionStorage.getItem('userEmail');
  const password = sessionStorage.getItem('userPassword');
 

  const [userData, setUserData] = useState({
    email: email || '',
    password: password || '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { data: phoneCheckData, error: phoneCheckError } = await supabase
        .from('user_info')
        .select('phone_number')
        .eq('phone_number', userData.phoneNumber)
        .single();

      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        toast.error('An error occurred while checking the phone number. Please try again.');
        return;
      }

      if (phoneCheckData) {
        toast.error('Phone number already exists. Please use a different phone number.');
        return;
      }

      const imagePath = await uploadImage();

      const { data: insertData, error: insertError } = await supabase
        .from('user_info')
        .insert([{
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone_number: userData.phoneNumber,
          password: userData.password, // Ensure to hash this in production
        }]);

      if (insertError) {
        toast.error('An error occurred while registering. Please try again.');
        return;
      }

      toast.success('Registration successful!');
      router.push('/profile');
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Toaster />
      <div className="relative flex-grow overflow-y-auto p-6">
        <button onClick={() => router.push('/welcomerentor')} className="absolute top-10 left-4 flex items-center justify-center w-12 h-12 rounded-lg border border-gray-200 shadow-sm text-black">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-2xl font-bold text-black text-left w-full px-6 mt-16 py-4">
          Your Information for a <br /> Smooth Reservation Experience
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          {/* Input fields */}
           {/* First Name */}
           <div className="w-11/12">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={userData.firstName}
              onChange={handleChange}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Last Name */}
          <div className="w-11/12">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={userData.lastName}
              onChange={handleChange}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div className="w-11/12">
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={userData.phoneNumber}
              onChange={handleChange}
              className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <div className="flex justify-center mb-4 w-4/5 mx-auto"> 
            <button type="submit" className="w-full bg-customBlue text-white py-3 rounded-lg hover:bg-blue-100">
              Get started
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}