import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PaymentSuccess = ({ reservationDate, startTime, endTime, totalPrice }) => {
    const router = useRouter();
    const [bookerName, setBookerName] = useState('Loading...');
    const [location, setLocation] = useState('Loading...');

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            try {
                const response = await fetch(`/api/payment-details?userId=27&parkingLotId=1`);
                if (!response.ok) {
                    throw new Error('Failed to fetch payment details');
                }

                const data = await response.json();
                setBookerName(data.bookerName || 'N/A');
                setLocation(data.location || 'N/A');
            } catch (error) {
                console.error('Error fetching payment details:', error);
            }
        };

        fetchPaymentDetails();
    }, []);

    const handleClose = () => {
        router.push('/Home');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-black text-white rounded-lg w-100 p-6 relative">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 bg-red-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-lg"
                >
                    X
                </button>
                <h2 className="text-2xl font-bold text-center mb-1">Reserved Success!</h2>
                <p className="text-gray-400 text-center mb-4">Your payment has been successfully done.</p>

                <div className="flex justify-between items-center bg-gray-800 py-4 px-6 rounded-lg mb-6">
                    <p className="text-gray-400 text-lg">Total Payment</p>
                    <p className="text-2xl font-bold">THB {totalPrice.toFixed(2)}</p>
                    <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center ml-2">
                        <span>✔</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <p className="text-gray-400 font-semibold">Location</p>
                        <p className="font-semibold">{location}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-400 font-semibold">Date & Time Reservation</p>
                        <div className="text-right pl-5">
                            <p><span className='text-white'>{reservationDate}</span></p>
                            <p><span className='text-white'>{startTime} - {endTime}</span></p>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-400 font-semibold">Booker Name</p>
                        <p>{bookerName}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
