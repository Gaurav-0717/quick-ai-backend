import express from "express";
import { upload } from "../configs/multer.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadFile);

export default router;