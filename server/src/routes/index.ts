import { Router } from "express";
import {
  buyCanvas,
  getCanvasRoute,
  testSaveImage,
} from "../handlers/buy_canvas";
import { deleteEverything } from "../handlers/delete_everything";
import { finishMosaic } from "../handlers/finish_mosaic";
import {
  getAllCanvases,
  getAllCollectionCanvases,
  getArtistCanvases,
  getCanvasByTime,
  getQueryCanvases,
} from "../handlers/get_canvases";
import { buyMosaic, checkMosaicListing } from "../handlers/marketplace";
import {
  finalizeCanvasUpdate,
  queueCanvasUpdate,
} from "../handlers/update_canvas";

export const routes: Router = Router();

routes.post("/buy_canvas", buyCanvas);
routes.post("/get_canvas", getCanvasRoute);
routes.post("/test_canvas_image", testSaveImage);
routes.post("/queue_canvas_update", queueCanvasUpdate);
routes.post("/finalize_canvas_update", finalizeCanvasUpdate);

/* Get Canvases */
routes.post("/all_canvases", getAllCanvases);
routes.post("/collection_canvases", getAllCollectionCanvases);
routes.post("/artist_canvases", getArtistCanvases);
routes.post("/canvas_by_time", getCanvasByTime);
routes.post("/query_canvases", getQueryCanvases);

/* Finish Mosaic */
routes.post("/finish_mosaic", finishMosaic);

/* Marketplace */
routes.post("/check_listing", checkMosaicListing);
routes.post("/buy_mosaic", buyMosaic);

/* DEV ROUTES (BE CAREFUL!) */
if (process.env.DEV === "true") {
  console.log("DEV ROUTES", process.env.DEV);
  routes.post("/delete_everything", deleteEverything);
}
