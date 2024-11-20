import sql from '../../../config/db';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { user_id, newPassword } = req.body;

    // Validate input
    if (!user_id || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required.' });
    }

    try {
      // Update the password in the database with encryption
      await sql`
        UPDATE user_info
        SET password = pgp_sym_encrypt(${newPassword}, 'parkify-secret')
        WHERE user_id = ${user_id};
      `;

      return res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: 'Failed to update password.' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
