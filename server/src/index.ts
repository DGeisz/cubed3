import "dotenv/config";
import express from "express";
import cors from "cors";
import { initMongo } from "./services/mongo/init";
import { routes } from "./routes";
import _ from "underscore";

const PORT: string | number = process.env.PORT || 4000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

(async () => {
  try {
    console.log("Starting mongo...");
    await initMongo();
    console.log("Got mongo...");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (e) {
    throw e;
  }
})();
