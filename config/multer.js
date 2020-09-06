const multer = require('multer')

const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        const uploadDir = path.join(__dirname, "..", "uploads");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = `${file.fieldname}-${Date.now()}${path.extname(
            file.originalname
        )}`;

        cb(null, fileName);
    }
});

const upload = multer({ storage });

module.exports = upload;