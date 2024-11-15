import sql from '../../../config/db';

export async function GET(req) {
    try {
        // Extract query parameters (e.g., parking lot ID) from the request URL
        const { searchParams } = new URL(req.url);
        const parkingLotId = searchParams.get('id');

        // Validate the required parameter
        if (!parkingLotId) {
            return new Response(JSON.stringify({ error: 'Parking lot ID is required' }), { status: 400 });
        }

        // Fetch parking details from the database using raw SQL
        const parkingDetails = await sql`
      SELECT location_name, price_per_hour
      FROM parking_lot
      WHERE parking_lot_id = ${parkingLotId}
    `;

        // Check if parking details are found
        if (parkingDetails.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Parking lot not found' }),
                { status: 404 }
            );
        }

        // Extract details
        const { location_name: parkingCode, price_per_hour: price } = parkingDetails[0];

        // Return the parking details
        return new Response(
            JSON.stringify({
                parkingCode,
                price: `${price} THB / HOURS`,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching parking details:', error);
        return new Response(
            JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
            { status: 500 }
        );
    }
}
