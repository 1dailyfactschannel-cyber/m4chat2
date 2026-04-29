import { db } from '@workspace/db';
import { usersTable, sessionsTable, chatsTable, messagesTable, chatMembersTable, reactionsTable, filesTable } from '@workspace/db/schema';
import { sql } from 'drizzle-orm';

export async function clearDatabase() {
  await db.execute(sql`TRUNCATE TABLE ${reactionsTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${filesTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${messagesTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${chatMembersTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${sessionsTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${chatsTable} CASCADE`);
  await db.execute(sql`TRUNCATE TABLE ${usersTable} CASCADE`);
}

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await clearDatabase();
});
