import { int, text, bigint, singlestoreTable } from "drizzle-orm/singlestore-core";

export const users = singlestoreTable("users_table", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: text("name"),
  age: int("age"),
});