/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

// DONE

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
  .createTable('time_logs')
  .addColumn('id', 'serial', column => column.primaryKey())
  .addColumn('ticket_id', 'integer', column => column.references('tickets.id'))
  .addColumn('user_id', 'integer', column => column.references('users.id'))
  .addColumn('hours', 'numeric')
  .addColumn('logged_at', 'timestamptz', column => column.defaultTo(sql`now()`))
  .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').execute();
}
