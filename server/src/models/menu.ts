import { model, Schema } from "mongoose";
import { IMenu } from "../types/menu";

const menuSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IMenu>("Menu", menuSchema);
