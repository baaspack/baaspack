import multer from 'multer';
import errorHandlers from '../handlers/errorHandlers';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const user = req.body.userId;
    console.log(req.body)
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const createStorageEndpoints = (router) => {
  return router.post('/uploads', upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const metadata = req.body;

    metadata.originalName = req.file.originalname;

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
