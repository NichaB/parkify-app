"use client";
import React, { useState, useEffect } from 'react';
import ActionButtons from './ActionButtons';

function ReservationComponent() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [total, setTotal] = useState('0 Hours');

    // Helper function to format yyyy-mm-dd to dd/mm/yyyy
    const formatDateToDisplay = (date) => {
        if (!date) return '';
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    };

    // Format startDate and endDate for reservation display
    const formattedStartDate = formatDateToDisplay(startDate);
    const formattedEndDate = formatDateToDisplay(endDate);
    const reservationDate = formattedStartDate && formattedEndDate ? `${formattedStartDate} - ${formattedEndDate}` : '';
    const allInputsFilled = startDate && endDate && startTime && endTime;

    useEffect(() => {
        calculateTotal();
    }, [startDate, endDate, startTime, endTime]);

    useEffect(() => {
        // Save reservation details to sessionStorage whenever they change
        sessionStorage.setItem('reservationDate', reservationDate);
        sessionStorage.setItem('startTime', startTime);
        sessionStorage.setItem('endTime', endTime);
        sessionStorage.setItem('total', total);
    }, [reservationDate, startTime, endTime, total]);

    const calculateTotal = () => {
        if (startDate && endDate && startTime && endTime) {
            // Create Date objects with timezone +07:00
            const start = new Date(`${startDate}T${startTime}:00+07:00`);
            const end = new Date(`${endDate}T${endTime}:00+07:00`);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                const diffMs = end - start;
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);
                const remainingHours = diffHours % 24;

                let totalText = '';
                if (diffDays > 0) totalText += `${diffDays} Day${diffDays > 1 ? 's' : ''} `;
                if (remainingHours > 0) totalText += `${remainingHours} Hour${remainingHours > 1 ? 's' : ''}`;
                setTotal(totalText || '0 Hours');
            } else {
                setTotal('Invalid time range');
            }
        } else {
            setTotal('0 Hours');
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg">
            {/* Responsive "Choose Your Reservation Period" Text */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-bold text-center sm:text-left text-black">
                    Choose Your Reservation Period
                </h2>
            </div>

            {/* Reservation Inputs */}
            <div className="flex flex-col sm:flex-row mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-col sm:w-1/2">
                    <label className="text-gray-500 text-sm">DATE</label>
                    <div className="flex space-x-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-col sm:w-1/2">
                    <label className="text-gray-500 text-sm">TIME</label>
                    <div className="flex space-x-2">
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300"
                        />
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-4">
                <span className="text-gray-600 font-semibold text-lg">TOTAL</span>
                <span className="text-gray-900 font-bold text-lg">{total}</span>
            </div>

            {/* Action Buttons */}
            <ActionButtons
                reservationDate={reservationDate}
                startDate={formattedStartDate}
                endDate={formattedEndDate}
                startTime={startTime}
                endTime={endTime}
            />
        </div>
    );
}

export default ReservationComponent;
