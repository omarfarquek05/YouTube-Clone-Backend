import multer from "multer";

const storage = multer.diskStorage({  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Save to public/temp
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //  const ext = path.extname(file.originalname);
    // cb(null, file.originalname + '-' + uniqueSuffix + ext);
      cb(null, file.originalname)
  }
})

export const upload = multer({ storage })