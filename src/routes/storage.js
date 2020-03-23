import fs from 'fs';
import multer from 'multer';
import errorHandlers from '../handlers/errorHandlers';

const storagePath = './public/uploads';
const storageRoute = '/uploads';

const makeDir = (directory) => {
  try {
    fs.statSync(directory);
  } catch (e) {
    fs.mkdir(directory, { recursive: true }, (e) => {
      console.log('directory created');
      if (e) throw e;
    });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // const user = req.body.userId;
    const { bucketPath } = req.body;
    console.log(bucketPath)
    makeDir(`${storagePath}/${bucketPath}`);
    cb(null, `${storagePath}/${bucketPath}`);
  },
  filename: (req, file, cb) => {
    //  TODO: change this to file name plus original name extension
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const createStorageEndpoints = (router) => {
  router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
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

  router.get(`${storageRoute}/:userId`, errorHandlers.catchErrors(async (req, res) => {
    fs.readdir(`${storagePath}/${req.params.userId}`, (err, files) => {
      if (err) {
        return err;
      }
      return res.json({ files: [...files] });
    });
  }));
};

export default createStorageEndpoints;
