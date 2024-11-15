"use client";
import React, { useEffect, useState } from 'react';

const ContactInfo = () => {
    const [contact, setContact] = useState(null);

    useEffect(() => {
        // Fetch contact information from the API
        const fetchContact = async () => {
            try {
                const response = await fetch('/api/contact?id=99'); // Adjust ID as needed
                if (!response.ok) {
                    throw new Error('Failed to fetch contact information');
                }

                const data = await response.json();
                setContact(data);
            } catch (error) {
                console.error('Error fetching contact:', error);
            }
        };

        fetchContact();
    }, []);

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <img
                src={contact ? contact.lessor_profile_pic : 'default_image.png'} // Use the fetched image URL or a default
                alt="Contact"
                className="w-20 h-20 rounded-full object-cover shadow-md"
            />
            <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold text-black">
                    {contact ? (
                        <>
                            <span>{contact.lessor_firstname}</span>
                            <span className="ml-2">{contact.lessor_lastname}</span>
                        </>
                    ) : 'Loading...'}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                    {contact ? contact.lessor_phone_number : 'Loading...'}
                </p>
            </div>
        </div>
    );
};

export default ContactInfo;
