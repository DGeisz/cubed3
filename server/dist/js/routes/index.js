"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const buy_canvas_1 = require("../handlers/buy_canvas");
const delete_everything_1 = require("../handlers/delete_everything");
const get_canvases_1 = require("../handlers/get_canvases");
const update_canvas_1 = require("../handlers/update_canvas");
exports.routes = (0, express_1.Router)();
exports.routes.post("/buy_canvas", buy_canvas_1.buyCanvas);
exports.routes.post("/get_canvas", buy_canvas_1.getCanvasRoute);
exports.routes.post("/queue_canvas_update", update_canvas_1.queueCanvasUpdate);
exports.routes.post("/finalize_canvas_update", update_canvas_1.finalizeCanvasUpdate);
/* Get Canvases */
exports.routes.post("/all_canvases", get_canvases_1.getAllCanvases);
exports.routes.post("/collection_canvases", get_canvases_1.getAllCollectionCanvases);
exports.routes.post("/artist_canvases", get_canvases_1.getArtistCanvases);
exports.routes.post("/canvas_by_time", get_canvases_1.getCanvasByTime);
/* DEV ROUTES (BE CAREFUL!) */
if (process.env.DEV === "true") {
    exports.routes.post("/delete_everything", delete_everything_1.deleteEverything);
}
