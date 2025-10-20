Manga Vault — Tiny MongoDB + Express API

What it is: a super-simple Node/Express API with MongoDB Atlas that tracks manga series → volumes → reviews; clean code, basic CRUD, minimal indexes, and schema validation.

Quick Start

1). npm install
set up your .env

2). set your env (.env)
MONGODB_URI="your-atlas-srv-uri"
DB_NAME=manga_vault
PORT=3000 

3). init + seed + run
npm run init     # validators + indexes
npm run seed     # sample data (One Piece, Naruto, etc.)
npm run dev      # start server (or: npm start)

open: http://localhost:3000 → "Manga Vault API is running."

Data Model (tiny)

series: { _id, title, author, genres[], status }

volumes: { _id, seriesId, volumeNumber, releaseDate, tags[] }

reviews: { _id, volumeId, rating, note, createdAt }

Indexes: series.title (text), volumes {seriesId,volumeNumber} unique, reviews {volumeId,createdAt}.

Validation: $jsonSchema on series and volumes (applied by npm run init).

Endpoints (how to use)

Health: GET / → API running.

Series:

GET /api/series (filters: ?q=Naruto, ?status=ongoing, ?genre=action)

GET /api/series/:id

Volumes:

GET /api/volumes (filter: ?seriesId=<SERIES_ID>)

GET /api/volumes/:id

POST /api/volumes

{ "seriesId":"<SERIES_ID>", "volumeNumber":3, "releaseDate":"2025-01-01", "tags":["first-print"] }

PATCH /api/volumes/:id

{ "tags":["collector","reprint"] }

Reviews:

GET /api/reviews (filter: ?volumeId=<VOLUME_ID>)

POST /api/reviews

{ "volumeId":"<VOLUME_ID>", "rating":5, "note":"Peak arc." }

DELETE /api/reviews/:id

Validation test (should return 400): POST /api/volumes/test-invalid

Postman or Thunder testing is welcome as well.

Compass (Atlas)

Open MongoDB Compass → New Connection → paste your SRV URI value (no quotes) → Connect → open manga_vault.

Troubleshooting

Empty results → npm run seed, check .env spacing.

400 on POST → Content-Type: application/json or fix schema fields.

ObjectId errors → use real _id from a GET response.

Refused connection → server not running or wrong PORT.
