import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error });
                }

                res.json({
                    message: "Upload successful",
                    url: result.secure_url
                });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};