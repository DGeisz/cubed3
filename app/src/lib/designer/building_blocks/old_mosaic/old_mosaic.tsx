import * as React from "react";
// import { StickerColor } from "../../../../global_architecture/cube_model/cube_model";

// interface HoverContextType {
//     mouseDown: boolean;
//     stickerColor: StickerColor;
// }

// const HoverContext = React.createContext<HoverContextType>({
//     mouseDown: false,
//     stickerColor: StickerColor.White,
// });

// interface MosaicPiecePosition {
//     left: number;
//     top: number;
//     // sticker: StickerColor;
// }

// interface MosaicPieceProps {
//     sideLength: number;
//     mosaicPosition: MosaicPiecePosition;
// }

// const stickerProportion = 0.75;
// const pieceRoundedProportion = 0.1;
// const stickerRoundedProportion = 0.06;

// const MosaicPiece: React.FC<MosaicPieceProps> = (props) => {
//     let stickerSideLen = props.sideLength * stickerProportion;
//     const smallMode = props.sideLength - stickerSideLen < 2;

//     const [color, setColor] = useState<StickerColor>(StickerColor.White);

//     stickerSideLen = smallMode ? props.sideLength : stickerSideLen;

//     const { mosaicPosition } = props;

//     const pieceRounded: number = props.sideLength * pieceRoundedProportion;
//     const stickerRounded = props.sideLength * stickerRoundedProportion;

//     const { mouseDown, stickerColor } = useContext(HoverContext);

//     return (
//         <div
//             className="absolute flex justify-center items-center"
//             style={{
//                 left: mosaicPosition.left,
//                 top: mosaicPosition.top,
//                 height: props.sideLength,
//                 width: props.sideLength,
//                 backgroundColor: "black",
//                 borderRadius: pieceRounded > 1 ? pieceRounded : undefined,
//             }}
//         >
//             <div
//                 onMouseOver={() => {
//                     if (mouseDown) {
//                         setColor(stickerColor);
//                     }
//                 }}
//                 style={{
//                     height: stickerSideLen,
//                     width: stickerSideLen,
//                     backgroundColor: stickerColorToRegularHex(color),
//                     borderRadius:
//                         stickerRounded > 1 ? stickerRounded : undefined,
//                     // border: smallMode ? "1px solid black" : undefined,
//                 }}
//             />
//         </div>
//     );
// };

// interface MosaicCubePosition {
//     left: number;
//     top: number;
// }

// interface MosaicCubeProps {
//     sideLength: number;
//     mosaicPosition: MosaicCubePosition;
// }

// const MosaicCube: React.FC<MosaicCubeProps> = (props) => {
//     const pieceSideLen = props.sideLength / 3;

//     const pieces: MosaicPiecePosition[] = useMemo(() => {
//         const pieces: MosaicPiecePosition[] = [];

//         for (const xs of _.range(3)) {
//             for (const ys of _.range(3)) {
//                 // const x = xs - 1;
//                 // const y = ys - 1;

//                 pieces.push({
//                     left: xs * pieceSideLen,
//                     // pieceSideLen * x +
//                     // props.sideLength / 2 -
//                     // pieceSideLen / 2,
//                     top: ys * pieceSideLen,
//                     // pieceSideLen * y +
//                     // props.sideLength / 2 -
//                     // pieceSideLen / 2,
//                 });
//             }
//         }

//         return pieces;
//     }, [props.sideLength]);

//     return (
//         <div
//             className="absolute"
//             style={{
//                 height: props.sideLength,
//                 width: props.sideLength,
//                 left: props.mosaicPosition.left,
//                 top: props.mosaicPosition.top,
//             }}
//         >
//             {pieces.map((p, i) => (
//                 <MosaicPiece
//                     key={i}
//                     sideLength={pieceSideLen}
//                     mosaicPosition={p}
//                 />
//             ))}
//         </div>
//     );
// };

// interface MosaicTapestryProps {
//     xDim: number;
//     yDim: number;
// }

// const MosaicTapestry: React.FC<MosaicTapestryProps> = (props) => {
//     const ref = useRef<HTMLDivElement>(null);

//     const [height, setHeight] = useState<number>(0);
//     const [width, setWidth] = useState<number>(0);
//     const mosaicSideLen = useRef<number>(0.1);

//     const cubePositions = useMemo(() => {
//         const outerDimProp = height / width;

//         // const bb = props.tapestry.getBoundingBox();

//         const bbDimProp = props.yDim / props.xDim;

//         let finalHeight;
//         let finalWidth;
//         let finalSideLength: number;

//         if (outerDimProp > bbDimProp) {
//             finalWidth = width;
//             finalHeight = bbDimProp * finalWidth;

//             finalSideLength = finalWidth / props.xDim;
//         } else {
//             finalHeight = height;
//             finalWidth = (1 / bbDimProp) * finalHeight;

//             finalSideLength = finalHeight / props.yDim;
//         }

//         mosaicSideLen.current = finalSideLength;

//         const leftBuffer = (width - finalWidth) / 2;
//         const topBuffer = (height - finalHeight) / 2;

//         const positions: MosaicCubePosition[] = [];

//         for (const x of _.range(props.xDim)) {
//             for (const y of _.range(props.yDim)) {
//                 positions.push({
//                     left: x * finalSideLength + leftBuffer,
//                     top: y * finalSideLength + topBuffer,
//                 });
//             }
//         }

//         return positions;
//     }, [height, width, props.xDim, props.yDim]);

//     useLayoutEffect(() => {
//         if (ref.current) {
//             setHeight(ref.current.clientHeight);
//             setWidth(ref.current.clientWidth);
//         }
//     }, []);

//     return (
//         <div ref={ref} className="relative h-full w-full">
//             {cubePositions.map((p, i) => (
//                 <MosaicCube
//                     key={i}
//                     mosaicPosition={p}
//                     sideLength={mosaicSideLen.current}
//                 />
//             ))}
//         </div>
//     );
// };
