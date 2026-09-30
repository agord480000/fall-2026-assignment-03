// TODO: Student implementation - Part 2: DAL for time logs
import {sql} from 'kysely';
import { db } from "../db/database.js";

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<any> {
  // TODO: Student implementation
  return await db
  .insertInto('time_logs')
  .values({
    ticket_id: ticketId,
    user_id: userId,
    hours,
  })
  .returningAll()
  .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  // TODO: Student implementation
  const row = await db
  .selectFrom('time_logs')
  .select(sql<string | null>`sum(hours)`.as('total'))
  .where('ticket_id', '=', ticketId)
  .executeTakeFirst();

  return Number(row?.total ?? 0);
}
