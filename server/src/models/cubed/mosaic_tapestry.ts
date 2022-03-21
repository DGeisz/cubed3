import {
  CubeModel,
  cubePieceSideLength,
  cubeSideLength,
  CubeTapestryModel,
  faceOrientationToVector,
  ServerCanvas,
  serverCanvasToTapestry,
  StickerColor,
  StickerColorHex,
  StickerColorRegularHex,
} from "./cube_model";
import { createCanvas } from "canvas";
import fs from "fs";

export function createRoundedSquare(
  context: CanvasRenderingContext2D,
  sideWidth: number,
  radius: number,
  xOffset: number,
  yOffset: number,
  fillColor: string
) {
  const linePoint = sideWidth - radius;

  context.fillStyle = fillColor;

  context.beginPath();
  context.moveTo(radius + xOffset, yOffset);
  context.lineTo(linePoint + xOffset, yOffset);
  context.quadraticCurveTo(
    sideWidth + xOffset,
    yOffset,
    sideWidth + xOffset,
    radius + yOffset
  );
  context.lineTo(sideWidth + xOffset, linePoint + yOffset);
  context.quadraticCurveTo(
    sideWidth + xOffset,
    sideWidth + yOffset,
    linePoint + xOffset,
    sideWidth + yOffset
  );
  context.lineTo(radius + xOffset, sideWidth + yOffset);
  context.quadraticCurveTo(
    xOffset,
    sideWidth + yOffset,
    xOffset,
    linePoint + yOffset
  );
  context.lineTo(xOffset, radius + yOffset);
  context.quadraticCurveTo(xOffset, yOffset, radius + xOffset, yOffset);
  context.closePath();
  context.fill();
}

export function stickerColorToHex(color: StickerColor): StickerColorHex {
  switch (color) {
    case StickerColor.Blue:
      return StickerColorHex.Blue;
    case StickerColor.Green:
      return StickerColorHex.Green;
    case StickerColor.Yellow:
      return StickerColorHex.Yellow;
    case StickerColor.White:
      return StickerColorHex.White;
    case StickerColor.Red:
      return StickerColorHex.Red;
    case StickerColor.Orange:
      return StickerColorHex.Orange;
    case StickerColor.TargetBlue:
      return StickerColorHex.TargetBlue;
    case StickerColor.HoverViolet:
      return StickerColorHex.HoverViolet;
    case StickerColor.SourceMint:
      return StickerColorHex.SourceMint;
  }
}

export function stickerColorToRegularHex(
  color: StickerColor
): StickerColorRegularHex {
  switch (color) {
    case StickerColor.Blue:
      return StickerColorRegularHex.Blue;
    case StickerColor.Green:
      return StickerColorRegularHex.Green;
    case StickerColor.Yellow:
      return StickerColorRegularHex.Yellow;
    case StickerColor.White:
      return StickerColorRegularHex.White;
    case StickerColor.Red:
      return StickerColorRegularHex.Red;
    case StickerColor.Orange:
      return StickerColorRegularHex.Orange;
  }

  return StickerColorRegularHex.Blue;
}

export function drawCubePiece(
  context: CanvasRenderingContext2D,
  sideLength: number,
  color: StickerColor,
  xOffset: number,
  yOffset: number
) {
  const pieceRadius = 0.1 * sideLength;
  const stickerLen = 0.8 * sideLength;

  createRoundedSquare(
    context,
    sideLength,
    pieceRadius,
    xOffset,
    yOffset,
    "black"
  );
  createRoundedSquare(
    context,
    stickerLen,
    pieceRadius,
    xOffset + pieceRadius,
    yOffset + pieceRadius,
    stickerColorToRegularHex(color)
  );
}

export function drawCubeFace(
  context: CanvasRenderingContext2D,
  sideLength: number,
  cube: CubeModel,
  xOffset: number,
  yOffset: number
) {
  const pieceSideLen = sideLength / 3;
  /* Get pieces */
  const pieces = cube.getFPieces();

  for (const piece of pieces) {
    const sticker = piece.stickers.find((s) => {
      const sVec = faceOrientationToVector(s.baseOrientation);
      sVec.applyQuaternion(piece.lastFixedQuaternion);

      return sVec.z > 0.001;
    });

    if (sticker) {
      drawCubePiece(
        context,
        pieceSideLen,
        sticker.color,
        xOffset +
          pieceSideLen +
          pieceSideLen * (piece.position.x / cubePieceSideLength),
        yOffset +
          pieceSideLen +
          (-piece.position.y / cubePieceSideLength) * pieceSideLen
      );
    }
  }
}

export function drawMosaicTapestry(
  context: CanvasRenderingContext2D,
  tapestry: CubeTapestryModel,
  height: number,
  width: number,
  xOffset = 0,
  yOffset = 0
) {
  const outerDimProp = height / width;
  const bb = tapestry.getBoundingBox();

  const bbDimProp = bb.height / bb.width;

  let finalHeight;
  let finalWidth;
  let finalSideLength: number;

  if (outerDimProp > bbDimProp) {
    finalWidth = width;
    finalHeight = bbDimProp * finalWidth;

    finalSideLength = finalWidth / (bb.width / cubeSideLength);
  } else {
    finalHeight = height;
    finalWidth = (1 / bbDimProp) * finalHeight;

    finalSideLength = finalHeight / (bb.height / cubeSideLength);
  }

  const tapXOffset = (width - finalWidth) / 2;
  const tapYOffset = (height - finalHeight) / 2;

  for (const c of tapestry.cubes) {
    drawCubeFace(
      context,
      finalSideLength,
      c.cube,
      xOffset +
        tapXOffset +
        ((c.position[0] - cubeSideLength / 2 - bb.left) / cubeSideLength) *
          finalSideLength,
      yOffset +
        tapYOffset +
        ((bb.top - (c.position[1] + cubeSideLength / 2)) / cubeSideLength) *
          finalSideLength
    );
  }
}

const HEIGHT = 400;
const WIDTH = 400;

export function drawMosaicImageToBuffer(cubedCanvas: ServerCanvas): Buffer {
  const tap = serverCanvasToTapestry(cubedCanvas);

  const canvas = createCanvas(HEIGHT, WIDTH);
  const context = canvas.getContext("2d");

  drawMosaicTapestry(context, tap, HEIGHT, WIDTH);

  return canvas.toBuffer("image/png");
}

export function drawMosaicImage(cubedCanvas: ServerCanvas) {
  const image = drawMosaicImageToBuffer(cubedCanvas);

  fs.writeFileSync("test.png", image);
  console.log("Wrote file!");
}
