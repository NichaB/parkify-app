"use client";
import React, { useEffect, useState } from 'react';
import ContactInfo from '../components/ContactInfo';
import CalculateInput from '../components/Booking_Calculate';

const ParkingDetail = () => {
    const [parkingCode, setParkingCode] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        const fetchParkingDetails = async () => {
            try {
                const response = await fetch('/api/parking?id=1'); // Mock Up parking_lot_id : 1
                if (!response.ok) {
                    throw new Error('Failed to fetch parking details.');
                }

                const data = await response.json();
                setParkingCode(data.parkingCode || 'N/A');
                setPrice(data.price || 'N/A');
            } catch (error) {
                console.error('Error fetching parking details:', error);
            }
        };

        fetchParkingDetails();
    }, []);

    return (
        <div className="w-full h-full bg-gray-100 flex flex-col items-center py-8">
            <div className="w-full max-w-screen-xl bg-white shadow-lg rounded-lg p-6 lg:p-12">
                <img
                    src="parkinglots-image.jpg"
                    alt="Parking Lot"
                    className="w-full h-96 object-cover rounded-lg mb-6"
                />
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-6">
                    <span className="bg-blue-500 text-white font-bold px-4 py-2 rounded-full text-base lg:text-xl">
                        {parkingCode || 'Loading...'}
                    </span>
                    <span className="bg-green-500 text-white font-bold px-4 py-2 rounded-full text-base lg:text-xl">
                        {price || 'Loading...'}
                    </span>
                </div>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <ContactInfo />
                    <CalculateInput />
                </div>
            </div>
        </div>
    );
};

export default ParkingDetail;
