import { getDB } from "./db.js";

async function ensureCollection(db, name, validator) {
  const exists = await db.listCollections({ name }).toArray();
  if (exists.length === 0) {
    await db.createCollection(name, { validator });
  } else {
    await db.command({ collMod: name, validator });
  }
}

async function main() {
  const db = await getDB();

  // Simple JSON Schema validators
  const seriesValidator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author", "genres", "status"],
      additionalProperties: false,
      properties: {
        _id: {},
        title: { bsonType: "string", minLength: 1 },
        author: { bsonType: "string", minLength: 1 },
        genres: { bsonType: "array", minItems: 1, items: { bsonType: "string" } },
        status: { enum: ["ongoing", "completed"] }
      }
    }
  };

  const volumesValidator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["seriesId", "volumeNumber", "releaseDate"],
      additionalProperties: false,
      properties: {
        _id: {},
        seriesId: { bsonType: "objectId" },
        volumeNumber: { bsonType: "int", minimum: 1, maximum: 5000 },
        releaseDate: { bsonType: "date" },
        tags: { bsonType: "array", items: { bsonType: "string" } }
      }
    }
  };

  await ensureCollection(db, "series", seriesValidator);
  await ensureCollection(db, "volumes", volumesValidator);
  await ensureCollection(db, "reviews", {}); // no validator needed here for simplicity

  // Indexes (simple and useful)
  await db.collection("series").createIndex({ title: "text" });
  await db.collection("volumes").createIndex({ seriesId: 1, volumeNumber: 1 }, { unique: true });
  await db.collection("reviews").createIndex({ volumeId: 1, createdAt: -1 });

  console.log("Collections ready with validators and indexes.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

