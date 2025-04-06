import type { MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import type { SingleStoreTable } from "drizzle-orm/singlestore";

declare module "drizzle-orm/mysql-core" {
  interface MySqlTableWithColumns<T extends TableConfig>
    extends SingleStoreTable<T> {}
}
