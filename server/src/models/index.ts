import { model, Schema } from "mongoose";

export interface CubePlacement {
  created: boolean;
  algo: number[];
  x: number;
  y: number;
}

const a = new Uint8Array([1, 2, 3, 4]);

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
  finalCubes: CubePlacement[];
  /* We tell the server what the next intension for the
  state of the canvas is so that we prevent data loss */
  intendedCubes: CubePlacement[];
}

/* Canvas */
const CanvasSchema = new Schema<Canvas>({
  artist: {
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
});

export const CanvasModel = model<Canvas>("Canvas", CanvasSchema);
