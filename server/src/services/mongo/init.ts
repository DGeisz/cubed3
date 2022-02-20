const mongoUri = `mongodb+srv://cubed:${process.env.MONGO_PASSWORD}@cluster0.r5rab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
import mongoose from "mongoose";

export async function initMongo() {
  await mongoose.connect(mongoUri);
}
