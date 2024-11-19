import sql from '../../../config/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const adminResult = await sql`
      SELECT admin_id, email, pgp_sym_decrypt(password, 'parkify-secret') AS decrypted_password
      FROM admin
      WHERE email = ${email}
      LIMIT 1
    `;

    if (adminResult.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const admin = adminResult[0];
    const isPasswordValid = password === admin.decrypted_password;

    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id, email: admin.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return new Response(
      JSON.stringify({ token }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during login.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
