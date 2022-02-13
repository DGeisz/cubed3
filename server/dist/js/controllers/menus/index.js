"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenu = exports.updateMenu = exports.retrieveMenu = exports.addMenu = exports.getMenus = void 0;
const menu_1 = __importDefault(require("../../models/menu"));
const getMenus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const menus = yield menu_1.default.find();
        res.status(200).json({ menus });
    }
    catch (error) {
        throw error;
    }
});
exports.getMenus = getMenus;
const addMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const menu = new menu_1.default({
            name: body.name,
            description: body.description,
            price: body.price,
        });
        const newMenu = yield menu.save();
        res.status(201).json(newMenu);
    }
    catch (error) {
        throw error;
    }
});
exports.addMenu = addMenu;
const retrieveMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, } = req;
        const menu = yield menu_1.default.findById({ _id: id });
        res.status(menu ? 200 : 404).json({ menu });
    }
    catch (error) {
        throw error;
    }
});
exports.retrieveMenu = retrieveMenu;
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { params: { id }, body, } = req;
        const updateMenu = yield menu_1.default.findByIdAndUpdate({ _id: id }, body);
        res.status(updateMenu ? 200 : 404).json({
            menu: updateMenu,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.updateMenu = updateMenu;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedMenu = yield menu_1.default.findByIdAndRemove(req.params.id);
        res.status(204).json({
            todo: deletedMenu,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.deleteMenu = deleteMenu;
