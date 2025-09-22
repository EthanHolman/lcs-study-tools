import { openDB } from "idb";
import {
  IDB_NAME,
  IDB_VERSION,
  IDB_STORES,
  IDB_SETTINGS,
} from "./idb-settings";
import { IdbMigrations } from "./migrations";

export async function getIdb() {
  const db = await openDB(IDB_NAME, IDB_VERSION, {
    // schema migrations:
    async upgrade(db, oldVersion, newVersion, transaction, e) {
      for (let v = oldVersion + 1; v <= newVersion!; v++) {
        IdbMigrations[v]?.schema?.(db);
      }
    },
    blocked() {
      // this event shouldn't trigger if we handle onversionchange correctly
      // it means that there's another open connection to the same database
      // and it wasn't closed after db.onversionchange triggered for it
      console.error("indexedDB blocked!");
    },
  });

  db.onversionchange = function () {
    db.close();
    alert("Database is outdated, please reload the page.");
  };

  // data migrations
  const dbVersion = db.version;

  while (true) {
    const dataVersion = (
      await db.get(IDB_STORES.Settings, IDB_SETTINGS.DataVersion)
    ).value;

    if (dataVersion === dbVersion) break;

    await IdbMigrations[dataVersion + 1]?.data?.(db);

    await db.put(IDB_STORES.Settings, {
      id: IDB_SETTINGS.DataVersion,
      value: dataVersion + 1,
    });
  }

  return db;
}
