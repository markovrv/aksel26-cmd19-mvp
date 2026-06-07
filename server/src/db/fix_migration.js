import { getDb, dbRun } from "./db.js";

async function fix() {
  await getDb();
  
  // Try to add updated_at column to users without DEFAULT (SQLite limitation)
  const columns = await dbRun("PRAGMA table_info(users)", []);
  
  try {
    await dbRun("ALTER TABLE users ADD COLUMN updated_at DATETIME", []);
    console.log("✅ Колонка updated_at добавлена в users");
  } catch (err) {
    if (err.message.includes("duplicate column")) {
      console.log("⏭️ Колонка updated_at уже существует в users");
    } else {
      console.error("❌ Ошибка:", err.message);
    }
  }
  
  process.exit(0);
}

fix().catch(e => { console.error(e.message); process.exit(1); });