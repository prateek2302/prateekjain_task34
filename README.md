# Schema Reference

A small full-stack demo showing how to reference one Mongoose schema from another. Users can be created, posts can be linked to a user, and the post feed displays the populated user details.

## Stack

- Express.js API
- MongoDB with Mongoose
- React and Vite

## Requirements

- Node.js 18 or newer
- npm
- A running MongoDB instance (local or hosted)

## Run locally

1. From this directory, install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `backend/.env` and set `MONGODB_URI` to your MongoDB connection string. The example value works with a local MongoDB server.

3. Start the API and frontend:

   ```bash
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The API runs on `http://localhost:5000`.

To run only the frontend, provide `VITE_API_URL` at build time if the API is not at `http://localhost:5000`. For a deployed backend, set `CLIENT_ORIGIN` to the frontend origin and `MONGODB_URI` to the hosted database connection string.

## Deploy the frontend to GitHub Pages

The repository includes a GitHub Actions workflow that builds and publishes the Vite frontend whenever changes are pushed to `main`. Create the repository as `schema-reference-task34`, then enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site will be published at `https://prateek2302.github.io/schema-reference-task34/`.

GitHub Pages hosts static frontend files only; it does not run the Express API or MongoDB. To enable the forms on the published site:

1. Deploy the `backend` folder to a Node.js hosting service and configure `MONGODB_URI`, `CLIENT_ORIGIN`, and (if needed) `PORT`.
2. Set the repository Actions variable `VITE_API_URL` to the deployed API's base URL under **Settings → Secrets and variables → Actions → Variables**.
3. Push a commit or manually run the **Deploy frontend to GitHub Pages** workflow to rebuild with that API URL.

Until `VITE_API_URL` is configured, the Pages site will show a clear API setup message when it attempts to load or submit data.

## API

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/users` | Create a user from `{ "name": "...", "email": "..." }` |
| `GET` | `/users` | List users for the post-author selector |
| `POST` | `/posts` | Create a post from `{ "title": "...", "content": "...", "userId": "<user id>" }` |
| `GET` | `/posts` | List posts with the referenced user's `name` and `email` populated |
| `GET` | `/health` | Check API availability |

`Post.user` is an ObjectId field that references the `User` model. The posts endpoint calls `.populate("user", "name email")` to return author information with each post.
