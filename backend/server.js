
import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit:"2mb"}));
app.use(morgan("dev"));

const db = new Database("./db/me.db");
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  education TEXT,     -- JSON
  links TEXT,         -- JSON
  skills TEXT,        -- JSON array
  projects TEXT,      -- JSON array
  work TEXT           -- JSON array
);
`);

const API_KEY = process.env.API_KEY || "dev-key";
function requireKey(req, res, next) {
  const key = req.header("x-api-key");
  if (key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
  next();
}

const parseRow = (row) => {
  if (!row) return null;
  const out = {...row};
  ["education","links","skills","projects","work"].forEach(k => {
    try { out[k] = row[k] ? JSON.parse(row[k]) : null } catch {}
  });
  return out;
};

// Health
app.get("/health", (req, res)=>res.json({ok:true}));

// List + filters
app.get("/profiles", (req, res) => {
  const { q, skill, limit = 50, offset = 0 } = req.query;
  let rows = db.prepare("SELECT * FROM profiles ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, offset);

  // in-memory search/filter for simplicity
  rows = rows.map(parseRow);
  if (skill) {
    rows = rows.filter(r => Array.isArray(r.skills) && r.skills.map(s=>String(s).toLowerCase()).includes(String(skill).toLowerCase()));
  }
  if (q) {
    const Q = String(q).toLowerCase();
    rows = rows.filter(r => JSON.stringify(r).toLowerCase().includes(Q));
  }
  res.json(rows);
});

// Get one
app.get("/profiles/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM profiles WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({error:"not found"});
  res.json(parseRow(row));
});

// Create
app.post("/profiles", requireKey, (req, res) => {
  const p = req.body;
  const info = db.prepare(`INSERT INTO profiles (name,email,education,links,skills,projects,work)
    VALUES (?,?,?,?,?,?,?)`).run(
      p.name, p.email,
      JSON.stringify(p.education||null),
      JSON.stringify(p.links||null),
      JSON.stringify(p.skills||[]),
      JSON.stringify(p.projects||[]),
      JSON.stringify(p.work||[])
    );
  res.status(201).json({ id: info.lastInsertRowid });
});

// Update
app.put("/profiles/:id", requireKey, (req, res) => {
  const id = req.params.id;
  const existing = db.prepare("SELECT * FROM profiles WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "not found" });
  const p = req.body;
  const merged = {
    ...parseRow(existing),
    ...p,
  };
  db.prepare(`UPDATE profiles SET
    name=?, email=?, education=?, links=?, skills=?, projects=?, work=?
    WHERE id=?`).run(
      merged.name,
      merged.email,
      JSON.stringify(merged.education||null),
      JSON.stringify(merged.links||null),
      JSON.stringify(merged.skills||[]),
      JSON.stringify(merged.projects||[]),
      JSON.stringify(merged.work||[]),
      id
    );
  res.json({ updated:true });
});

// Simple stats for skills (top)
app.get("/skills/top", (req, res) => {
  const rows = db.prepare("SELECT skills FROM profiles").all();
  const counts = {};
  rows.forEach(r => {
    try {
      const arr = JSON.parse(r.skills || "[]");
      arr.forEach(s => {
        const k = String(s||"").toLowerCase();
        if (!k) return;
        counts[k] = (counts[k]||0)+1;
      });
    } catch {}
  });
  res.json(Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count})));
});

// Global search across all profile fields
app.get("/search", (req, res) => {
  const q = (req.query.q||"").toLowerCase();
  if (!q) return res.json([]);
  const rows = db.prepare("SELECT * FROM profiles").all().map(parseRow);
  const matches = rows.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  res.json(matches);
});

// 404
app.use((req,res)=>res.status(404).json({error:"Not found"}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log(`API on http://localhost:${PORT}`));
