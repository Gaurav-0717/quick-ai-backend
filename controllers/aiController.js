import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../configs/db.js";
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from "streamifier";
import { clerkClient } from '@clerk/express';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ 
  model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
  }
});

const generateWithRetry = async (model, prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (
        error.message?.includes("503") &&
        i < retries - 1
      ) {
        console.log(`Retry ${i + 1}/3`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }
};

export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, length } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 50;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        const result = await generateWithRetry(model, prompt);
        const content = result.response.text();

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'article')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content, warning });

    } catch (error) {
        if (error.message?.includes("503")) {
            return res.json({
                success: false,
                message: "Gemini AI is currently busy. Please try again in a few seconds."
            });
        }

        return res.json({
            success: false,
            message: error.message || 'Generation error'
        });
    }
}


export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 50;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        const result = await generateWithRetry(model, prompt);
        const content = result.response.text();

        if (!content) {
            throw new Error("No content generated from AI");
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'blog-title')`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }

        res.json({ success: true, content, warning });

    } catch (error) {
        if (error.message?.includes("503")) {
            return res.json({
                success: false,
                message: "Gemini AI is currently busy. Please try again in a few seconds."
            });
        }

        return res.json({
            success: false,
            message: error.message || 'Generation error'
        });
    }
}


export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { prompt, publish } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 55;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        if (!process.env.CLIPDROP_API_KEY) {
            return res.json({ success: false, message: "CLIPDROP_API_KEY is not set" });
        }

        const formData = new FormData()
        formData.append('prompt', prompt);
        const response = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY
            },
            responseType: 'arraybuffer',
        });

        const data = response.data;
        if (!data || data.length === 0) {
            throw new Error("Empty response from Clipdrop API");
        }

        const base64Image = `data:image/png;base64,${data.toString('base64')}`;

        const { secure_url } = await cloudinary.uploader.upload(base64Image)

        await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})`;

        res.json({ success: true, content: secure_url, warning });

    } catch (error) {
        res.json({ success: false, message: error.message || "Unknown error" });
    }
}

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth();
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 50;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        const stream = cloudinary.uploader.upload_stream(
            { 
                folder: "uploads",
                transformation: [
                    {
                        effect: 'background_removal',
                        background_removal: 'remove_the_background'
                    }
                ]
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error });
                }
                process.nextTick(() => res.locals.cloudinaryResult = result);
            }
        );
        streamifier.createReadStream(image.buffer).pipe(stream);
        await new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
        const result = res.locals.cloudinaryResult;
        const { secure_url } = result;

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')`;

        res.json({ success: true, content: secure_url, warning });

    } catch (error) {
        res.json({ success: false, message: error.message || 'Error' });
    }
}

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { object } = req.body;
        const image = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 55;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "uploads" },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ error });
                }
                process.nextTick(() => res.locals.uploadResult = result);
            }
        );
        streamifier.createReadStream(image.buffer).pipe(uploadStream);
        await new Promise((resolve, reject) => {
            uploadStream.on('finish', resolve);
            uploadStream.on('error', reject);
        });
        const uploadResult = res.locals.uploadResult;
        const { public_id } = uploadResult;

        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        })

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Remove ${object} from image`},
        ${imageUrl}, 'image')`;

        res.json({ success: true, content: imageUrl, warning });

    } catch (error) {
        res.json({ success: false, message: error.message || 'Error' });
    }
}

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth();
        const resume = req.file;
        const plan = req.plan;
        const free_usage = req.free_usage;

        const FREE_LIMIT = 55;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT) {
            return res.json({ success: false, message: "Free usage limit exceeded. Please upgrade to premium plan." });
        }

        // Warn if close to limit
        let warning = null;
        if (plan !== 'premium' && free_usage >= FREE_LIMIT - 3) {
            warning = `You are close to your free usage limit. Only ${FREE_LIMIT - free_usage} uses left.`;
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({
                success: false,
                message: "Resume file size exceeds allowed size (5MB)"
            })
        }

        // Dynamically import pdf-parse for ESM compatibility
        const pdfModule = await import('pdf-parse');
        const pdfParse = pdfModule.default || pdfModule;

        const dataBuffer = resume.buffer;
        const pdfData = await pdfParse(dataBuffer);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weakness, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

        const result = await generateWithRetry(model, prompt);
        const content = result.response.text();
        if (!content) {
            return res.json({ success: false, message: "AI did not return any review content. Please try again with a different file or later." });
        }

        await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume',
        ${content}, 'resume-review')`;

        res.json({ success: true, content, warning });

    } catch (error) {
        res.json({ success: false, message: error.message || 'Error' });
    }
}
