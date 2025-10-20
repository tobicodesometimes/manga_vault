import dotenv from "dotenv";
import { MongoClient } from "mongodb";
dotenv.config();

const connectionString = process.env.MONGODB_URI

const client = new MongoClient(connectionString);

let db;

export async function getDB() {
  if (!db) {
    await client.connect();
    console.log('Connected to MongoDB')
    db = client.db(process.env.DB_NAME);
  }
  return db;
}

export function col(db) {
  return {
    series: db.collection("series"),
    volumes: db.collection("volumes"),
    reviews: db.collection("reviews")
  };
}
