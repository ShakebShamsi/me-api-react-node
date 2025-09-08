
import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("./db/me.db");
db.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  education TEXT,
  links TEXT,
  skills TEXT,
  projects TEXT,
  work TEXT
);
`);

const data = JSON.parse(fs.readFileSync("./db/seed_profiles.json","utf8"));

const insert = db.prepare(`INSERT INTO profiles (name,email,education,links,skills,projects,work)
VALUES (?,?,?,?,?,?,?)`);

const tx = db.transaction((profiles)=>{
  db.prepare("DELETE FROM profiles").run();
  for (const p of profiles) {
    insert.run(
      p.name, p.email,
      JSON.stringify(p.education||null),
      JSON.stringify(p.links||null),
      JSON.stringify(p.skills||[]),
      JSON.stringify(p.projects||[]),
      JSON.stringify(p.work||[])
    );
  }
});

tx(data.profiles);
console.log("Seeded", data.profiles.length, "profiles.");
