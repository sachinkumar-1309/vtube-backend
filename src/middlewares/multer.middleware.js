import multer from "multer"; // JANE se pehle mujhse mil k jana

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  } /* it will save the name of the image as original name  in our directory, Console krna h file KO*/,
});

export const upload = multer({
  storage, //storage:storage ko sirf storage v likh skte h Q ki es6 update hai
});
