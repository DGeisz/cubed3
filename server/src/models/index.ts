import { model, Schema, Document } from "mongoose";

export interface CubePlacement {
  created: boolean;
  algo: number[];
  x: number;
  y: number;
}

const CubePlacementSchema = new Schema<CubePlacement>({
  /* Indicates whether a cube was created or
  deleted from this location */
  created: {
    type: Boolean,
    required: true,
  },
  algo: {
    type: [Number],
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
});

interface Canvas {
  artist: string;
  time: number;
  price: number;
  collectionName: string;
  finalCubes: CubePlacement[];
  /* We tell the server what the next intension for the
  state of the canvas is so that we prevent data loss */
  intendedCubes: CubePlacement[];
  finished: boolean;
}

/* Canvas */
const CanvasSchema = new Schema<Canvas>({
  artist: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
    unique: true,
  },
  finalCubes: {
    type: [CubePlacementSchema],
    required: true,
  },
  intendedCubes: {
    type: [CubePlacementSchema],
    required: true,
  },
  finished: {
    type: Boolean,
    required: true,
  },
});

export const CanvasModel = model<Canvas>("Canvas", CanvasSchema);

export async function getMongoCanvas(time: number) {
  /* Ok, now let's fetch the canvas */
  const c = await CanvasModel.find({ time });

  if (c.length !== 1) {
    return undefined;
  }

  return c[0];
}
