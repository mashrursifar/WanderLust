const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary-v2");
const multer = require("multer")

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "wanderLust_DEV",
        allowed_formats: ["png", "jpg", "jpeg"], // supports promises as well
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const err = new Error("Only JPG, JPEG, and PNG images are allowed.");
        err.code = "INVALID_FILE_TYPE";
        cb(err);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter,
});

module.exports = { cloudinary, storage, upload };
