import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import { getDB, col } from "./db.js";
import { ObjectId } from "mongodb";

dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("dev"));

let collections;
app.use(async (_req, _res, next) => {
  if (!collections) {
    const db = await getDB();
    collections = col(db);
  }
  next();
});

/* -------- GET -------- */
app.get("/api/series", async (req, res) => {
  const { q, status, genre } = req.query;
  const filter = {};
  if (q) filter.$text = { $search: q };
  if (status) filter.status = status;
  if (genre) filter.genres = genre;
  const docs = await collections.series.find(filter).limit(50).toArray();
  res.json(docs);
});

app.get("/api/series/:id", async (req, res) => {
  const doc = await collections.series.findOne({ _id: new ObjectId(req.params.id) });
  if (!doc) return res.status(404).json({ error: "Series not found" });
  res.json(doc);
});

app.get("/api/volumes", async (req, res) => {
  const { seriesId } = req.query;
  const filter = seriesId ? { seriesId: new ObjectId(seriesId) } : {};
  const docs = await collections.volumes.find(filter).sort({ volumeNumber: 1 }).toArray();
  res.json(docs);
});

app.get("/api/volumes/:id", async (req, res) => {
  const doc = await collections.volumes.findOne({ _id: new ObjectId(req.params.id) });
  if (!doc) return res.status(404).json({ error: "Volume not found" });
  res.json(doc);
});

app.get("/api/reviews", async (req, res) => {
  const { volumeId } = req.query;
  const filter = volumeId ? { volumeId: new ObjectId(volumeId) } : {};
  const docs = await collections.reviews.find(filter).sort({ createdAt: -1 }).toArray();
  res.json(docs);
});

/* -------- POST -------- */
app.post("/api/volumes", async (req, res) => {
  try {
    const { seriesId, volumeNumber, releaseDate, tags = [] } = req.body;
    const r = await collections.volumes.insertOne({
      seriesId: new ObjectId(seriesId),
      volumeNumber: parseInt(volumeNumber, 10),
      releaseDate: new Date(releaseDate),
      tags
    });
    res.status(201).json(await collections.volumes.findOne({ _id: r.insertedId }));
  } catch (e) {
    res.status(400).json({ error: "Validation failed", details: e.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { volumeId, rating, note = "" } = req.body;
    const r = await collections.reviews.insertOne({
      volumeId: new ObjectId(volumeId),
      rating: parseInt(rating, 10),
      note,
      createdAt: new Date()
    });
    res.status(201).json(await collections.reviews.findOne({ _id: r.insertedId }));
  } catch (e) {
    res.status(400).json({ error: "Validation failed", details: e.message });
  }
});

// Simple validator test route
app.post("/api/volumes/test-invalid", async (_req, res) => {
  try {
    await collections.volumes.insertOne({
      seriesId: new ObjectId(),
      volumeNumber: 0,          // invalid (must be >=1)
      releaseDate: new Date()
    });
    res.json({ ok: true, note: "Unexpected: validator allowed this" });
  } catch (e) {
    res.status(400).json({ error: "Expected validation error", details: e.message });
  }
});

/* -------- PATCH -------- */
app.patch("/api/volumes/:id", async (req, res) => {
  const { releaseDate, tags } = req.body;
  const update = { $set: {} };
  if (releaseDate !== undefined) update.$set.releaseDate = new Date(releaseDate);
  if (tags !== undefined) update.$set.tags = tags;

  const r = await collections.volumes.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    update,
    { returnDocument: "after" }
  );
  if (!r.value) return res.status(404).json({ error: "Volume not found" });
  res.json(r.value);
});

/* -------- DELETE -------- */
app.delete("/api/reviews/:id", async (req, res) => {
  const r = await collections.reviews.deleteOne({ _id: new ObjectId(req.params.id) });
  if (!r.deletedCount) return res.status(404).json({ error: "Review not found" });
  res.json({ ok: true });
});

app.get("/", (_req, res) => res.send("Manga Vault API is running."));
app.listen(process.env.PORT, () => console.log(`http://localhost:${process.env.PORT}`));

