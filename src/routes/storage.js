import multer from 'multer';
// import path from 'path';
import errorHandlers from '../handlers/errorHandlers';
// import mongoose from '../db/mongoose';

// async const storeMetadata = (metadata) => {
//   await mongoose.connectToDb()
//   try {
//     mongoose.create(metadata)
//   } catch (err) {
//     console.log('error saving metadata');
//     console.error;
//   }
// }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const createStorageEndpoints = (router, directory) => {
  return router.post('/uploads', upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const metadata = req.body;

    metadata.originalName = req.file.originalname;
    console.log(metadata)

    const { file } = req;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    res.send(file);
  }));
};

export default createStorageEndpoints;

// import path from 'path';
// this works to send an image file
// const createStorageEndpoints = (router, directory) => {
//   return router.get('/images/:image', errorHandlers.catchErrors(async (req, res) => {
//     const imageName = req.params.image;
//     res.sendFile(path.join(__dirname, '/../public/hello.html'));
//   }))
