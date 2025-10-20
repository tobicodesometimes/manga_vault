import { getDB, col } from "./db.js";
import { ObjectId } from "mongodb";

async function main() {
  const db = await getDB();
  const { series, volumes, reviews } = col(db);

  await Promise.all([series.deleteMany({}), volumes.deleteMany({}), reviews.deleteMany({})]);

  const s = await series.insertMany([
    { title: "One Piece", author: "Eiichiro Oda", genres: ["adventure","fantasy"], status: "ongoing" },
    { title: "Naruto", author: "Masashi Kishimoto", genres: ["action","ninja"], status: "completed" },
    { title: "Bleach", author: "Tite Kubo", genres: ["action","supernatural"], status: "completed" },
    { title: "Dragon Ball", author: "Akira Toriyama", genres: ["action","martial-arts"], status: "completed" },
    { title: "Neon Genesis Evangelion", author: "Yoshiyuki Sadamoto", genres: ["mecha","psychological"], status: "completed" },
    { title: "Case Closed", author: "Gosho Aoyama", genres: ["mystery","detective"], status: "ongoing" },
    { title: "Death Note", author: "Tsugumi Ohba", genres: ["thriller","supernatural"], status: "completed" },
    { title: "Fullmetal Alchemist", author: "Hiromu Arakawa", genres: ["fantasy","adventure"], status: "completed" }
  ]);
  const seriesIds = Object.values(s.insertedIds);

  // Creates 16 volumes (2 per series for simplicity)
  const volDocs = [];
  let idx = 0;
  for (const sid of seriesIds) {
    volDocs.push(
      { seriesId: sid, volumeNumber: 1, releaseDate: new Date(2000, (idx % 12), 1), tags: ["first-print"] },
      { seriesId: sid, volumeNumber: 2, releaseDate: new Date(2000, (idx % 12) + 1, 1), tags: ["standard"] }
    );
    idx++;
  }
  const v = await volumes.insertMany(volDocs);
  const volumeIds = Object.values(v.insertedIds);

  // A few reviews
  const now = Date.now();
  const revs = [];
  for (let i = 0; i < 20; i++) {
    revs.push({
      volumeId: volumeIds[i % volumeIds.length],
      rating: 1 + (i % 5),
      note: i % 3 === 0 ? "Great read!" : "Solid volume.",
      createdAt: new Date(now - i * 86400000)
    });
  }
  await reviews.insertMany(revs);

  console.log("Seeded popular manga data.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
