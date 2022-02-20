import { Router } from "express";
import { buyCanvas, getCanvasRoute } from "../handlers/buy_canvas";
import { queueCanvasUpdate } from "../handlers/update_canvas";

// const menuRoutes: Router = Router();

// menuRoutes.get("/menu", getMenus);
// menuRoutes.post("/menu", addMenu);
// menuRoutes.put("/menu/:id", updateMenu);
// menuRoutes.delete("/menu/:id", deleteMenu);
// menuRoutes.get("/menu/:id", retrieveMenu);

// export default menuRoutes;

export const routes: Router = Router();

routes.post("/buy_canvas", buyCanvas);
routes.post("/get_canvas", getCanvasRoute);
routes.post("/queue_canvas_update", queueCanvasUpdate);
