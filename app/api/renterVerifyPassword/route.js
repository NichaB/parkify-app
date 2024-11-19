import sql from '../../../config/db';

export async function POST(req) {
  try {
    const { email, currentPassword } = await req.json();

    // Validate input
    if (!email || !currentPassword) {
      return new Response(
        JSON.stringify({ error: 'Email and current password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }


    // Query to get the stored password
    const userData = await sql`
      SELECT 
        email,
        pgp_sym_decrypt(password::bytea,'parkify-secret') AS decrypted_password
      FROM user_info
      WHERE email = ${email};
    `;

    // Check if user exists
    if (userData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = userData[0];
    const isPasswordValid = currentPassword === user.decrypted_password;

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Password verified successfully.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Password Verification Error:', error);
    return new Response(
      JSON.stringify({ error: 'Error verifying password.', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
