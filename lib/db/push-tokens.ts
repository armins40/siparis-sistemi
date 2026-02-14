import { sql } from './client';

export async function savePushToken(userId: string, token: string): Promise<boolean> {
  try {
    const id = crypto.randomUUID();
    const trimmed = token.trim();
    await sql`
      INSERT INTO push_tokens (id, user_id, token)
      VALUES (${id}, ${userId}, ${trimmed})
      ON CONFLICT (token) DO UPDATE SET user_id = ${userId}, created_at = NOW()
    `;
    return true;
  } catch (e) {
    console.error('savePushToken:', e);
    return false;
  }
}

export async function getTokensByUser(userId: string): Promise<string[]> {
  try {
    const result = await sql<{ token: string }>`
      SELECT token FROM push_tokens WHERE user_id = ${userId}
    `;
    return result.rows.map((r) => r.token);
  } catch (e) {
    console.error('getTokensByUser:', e);
    return [];
  }
}

export const getPushTokensByUserId = getTokensByUser;
