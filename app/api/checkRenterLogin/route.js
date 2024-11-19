// app/api/checkLogin/route.js
import sql from '../../../config/db'; // Adjust this path as needed

export async function POST(req) {
  try {
    const { email, password } = await req.json(); // Parse request JSON

    // Basic validation
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use raw SQL to check if the user exists with the provided password
    const userData = await sql`
    select
  user_id,
  email,
  pgp_sym_decrypt (password::bytea, 'parkify-secret') as decrypted_password
from
  user_info
where
  email = ${email};
    `;
    

    // Check if user exists
    if (userData.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const user = userData[0];
    const isPasswordValid = password === user.decrypted_password;

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Login successful, return user details excluding sensitive information
    return new Response(JSON.stringify({ message: 'Login successful', user_id: user.user_id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Database or server error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }); a
  }
}
