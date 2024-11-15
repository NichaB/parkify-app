import sql from '../../../config/db';

export async function POST(req) {
    try {
        // Parse the request body
        const {
            parkingLotId,
            userId,
            reservationDate,
            startTime,
            endTime,
            pricePerHour,
            carId,
        } = await req.json();

        // Validate input
        if (!parkingLotId || !userId || !reservationDate || !startTime || !endTime || !pricePerHour || !carId) {
            return new Response(
                JSON.stringify({ error: 'All fields are required.' }),
                { status: 400 }
            );
        }

        // Convert reservation date to the appropriate format
        const reservationDateTime = new Date(`${reservationDate}T00:00:00+07:00`);

        // Calculate start and end timestamps
        const startDateTime = new Date(`${reservationDate}T${startTime}:00+07:00`);
        const endDateTime = new Date(`${reservationDate}T${endTime}:00+07:00`);

        // Calculate total hours and price
        const totalHours = Math.abs((endDateTime - startDateTime) / (1000 * 60 * 60));
        const totalPrice = totalHours * pricePerHour;

        // Insert the reservation into the database
        const result = await sql`
            INSERT INTO reservation (
                parking_lot_id,
                user_id,
                reservation_date,
                start_time,
                end_time,
                total_price,
                duration_hour,
                duration_day,
                car_id
            )
            VALUES (
                ${parkingLotId},
                ${userId},
                ${reservationDateTime},
                ${startDateTime.toISOString()},
                ${endDateTime.toISOString()},
                ${totalPrice},
                ${totalHours},
                ${Math.floor(totalHours / 24)},
                ${carId}
            )
            RETURNING reservation_id
        `;

        if (result.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Reservation could not be created.' }),
                { status: 500 }
            );
        }

        // Respond with the reservation ID
        return new Response(
            JSON.stringify({ message: 'Reservation created successfully.', reservationId: result[0].reservation_id }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error creating reservation:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error.' }),
            { status: 500 }
        );
    }
}
