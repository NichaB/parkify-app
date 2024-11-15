import sql from '../../../config/db';

export async function GET(req) {
    try {
        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const parkingLotId = searchParams.get('parkingLotId');

        // Validate required parameters
        if (!userId || !parkingLotId) {
            return new Response(
                JSON.stringify({ error: 'Both userId and parkingLotId are required' }),
                { status: 400 }
            );
        }

        // Fetch user phone number
        const userInfo = await sql`
            SELECT phone_number
            FROM user_info
            WHERE user_id = ${userId}
        `;

        if (userInfo.length === 0) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404 }
            );
        }

        // Fetch parking lot details
        const parkingInfo = await sql`
            SELECT location_name, price_per_hour
            FROM parking_lot
            WHERE parking_lot_id = ${parkingLotId}
        `;

        if (parkingInfo.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Parking lot not found' }),
                { status: 404 }
            );
        }

        // Construct the response
        const response = {
            phoneNumber: userInfo[0].phone_number,
            locationName: parkingInfo[0].location_name,
            pricePerHour: parkingInfo[0].price_per_hour,
        };

        return new Response(JSON.stringify(response), { status: 200 });
    } catch (error) {
        console.error('Error fetching details:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500 }
        );
    }
}
