import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import menuRoutes from "./routes";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/buy_canvas", (req: Request, res: Response) => {
  req.body;

  console.log("this is body", req.body);

  res.json(req.body);
});

// app.get("/", (req: Request, res: Response) => {
//   res.json({ hey: 2 });
// });

const PORT: string | number = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// app.use(cors());
// app.use(express.json());
// app.use(menuRoutes);

// const uri: string = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.raz9g.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
// mongoose
//   .connect(uri)
//   .then(() =>
//     app.listen(PORT, () =>
//       console.log(`Server running on http://localhost:${PORT}`)
//     )
//   )
//   .catch((error) => {
//     throw error;
//   });
