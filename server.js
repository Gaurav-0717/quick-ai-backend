import connectCloudinary from './configs/cloudinary.js';

console.log("BOOT STARTED");
const startServer = async () => {
  try {
    console.log("BEFORE CLOUDINARY");
    await connectCloudinary();
    console.log("AFTER CLOUDINARY");

    app.use(cors());
    app.use(express.json());
    app.use(clerkMiddleware());

    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    app.use(requireAuth());

    app.use('/api/ai', aiRouter);
    app.use('/api/user', userRouter);
    app.use('/api/upload', uploadRouter);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
};

startServer();