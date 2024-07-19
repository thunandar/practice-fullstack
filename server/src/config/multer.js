const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'src/upload/images')
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+""+fileExtension)
    }
})

exports.upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('data:image/')) {
            cb(null, true); 
        } else {
            cb(new Error('Invalid file type')); 
        }
    },
    limits: { fileSize: 300000 } // 0.3MB in bytes
})