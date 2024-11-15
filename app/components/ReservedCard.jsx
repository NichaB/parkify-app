import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabaseClient";

const ReservationCard = () => {
    const [reservations, setReservations] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [reservationToDelete, setReservationToDelete] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchReservations = async () => {
            const { data, error } = await supabase.from("reservation").select(`
                    reservation_id,
                    parking_lot_id,
                    start_time,
                    end_time,
                    duration_hour,
                    parking_lot (
                        location_name
                    )
                `);

            if (error) {
                console.error("Error fetching reservations:", error.message);
            } else {
                setReservations(data);
            }
        };

        fetchReservations();
    }, []);

    const handleDeleteClick = (reservation) => {
        const currentTime = new Date(); // Get current real-time
        const startTime = new Date(reservation.start_time); // Convert start_time to a Date object

        // Calculate the time difference in hours
        const timeDifferenceInHours = (startTime - currentTime) / (1000 * 60 * 60);

        if (timeDifferenceInHours > 24) {
            // Allow cancellation if the start_time is more than 24 hours away
            setReservationToDelete(reservation);
            setShowConfirmation(true);
        } else {
            // Show alert if the start_time is within 24 hours
            alert("Reservations with a start time less than 24 hours from now cannot be canceled.");
        }
    };


    const confirmDelete = async () => {
        if (reservationToDelete) {
            const { error } = await supabase
                .from("reservation")
                .delete()
                .eq("reservation_id", reservationToDelete.reservation_id);

            if (error) {
                console.error("Error deleting reservation:", error.message);
            } else {
                setReservations(
                    reservations.filter(
                        (res) => res.reservation_id !== reservationToDelete.reservation_id
                    )
                );
                setShowConfirmation(false);
                setReservationToDelete(null);
            }
        }
    };

    if (!isMounted) return null;

    return (
        <div className="overflow-x-auto py-4">
            <div className="flex space-x-4">
                {reservations.map((reservation, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 text-white rounded-lg p-4 shadow-lg flex flex-col items-start mb-4 max-w-xl"
                    >
                        <div className="flex justify-between w-full mb-2">
                            <h2 className="text-4xl font-bold">Reserved</h2>
                            <span className="ml-2 bg-gray-600 text-sm py-3 px-2 rounded">
                                {reservation.parking_lot?.location_name || "Loading..."}
                            </span>
                        </div>
                        <div className="flex items-center mb-1">
                            <img
                                src="mapPin.png"
                                alt="location icon"
                                className="mr-2 w-5 h-6"
                            />
                            <p className="text-lg font-semibold">
                                {reservation.parking_lot?.location_name || "Loading..."}
                            </p>
                        </div>
                        <div className="flex items-center mb-1">
                            <img src="Clock.png" alt="clock icon" className="mr-2 w-5 h-5" />
                            <p className="text-lg">
                                {new Date(reservation.start_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}{" "}
                                -
                                {new Date(reservation.end_time).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div className="flex items-center mb-1">
                            <img
                                src="Calendar.png"
                                alt="calendar icon"
                                className="mr-2 w-5 h-5"
                            />
                            <p className="text-lg">
                                {new Date(reservation.start_time).toLocaleDateString("en-GB")}
                            </p>
                        </div>
                        <div className="flex justify-between items-center w-full mt-3">
                            <button
                                onClick={() => handleDeleteClick(reservation)}
                                className="bg-red-500 text-white py-1 px-4 rounded-lg"
                            >
                                Cancel
                            </button>
                            <div className="text-right text-xl font-bold">
                                {reservation.duration_hour} HOURS
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Confirm Cancellation</h2>
                        <p>Are you sure you want to cancel this reservation?</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationCard;
