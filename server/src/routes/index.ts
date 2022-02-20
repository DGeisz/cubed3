import { Router } from "express";
import { buyCanvas, getCanvasRoute } from "../handlers/buy_canvas";
import {
  finalizeCanvasUpdate,
  queueCanvasUpdate,
} from "../handlers/update_canvas";

export const routes: Router = Router();

routes.post("/buy_canvas", buyCanvas);
routes.post("/get_canvas", getCanvasRoute);
routes.post("/queue_canvas_update", queueCanvasUpdate);
routes.post("/finalize_canvas_update", finalizeCanvasUpdate);
