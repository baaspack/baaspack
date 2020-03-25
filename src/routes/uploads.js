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

const saveMetadata = async (metadata, model) => {
  const documents = await model.find({ filename: metadata.filename, userId: metadata.userId, bucket: metadata.bucket })
  if (documents.length === 0) {
    console.log('saving metadata');
    return model.create(metadata);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `${storagePath}/${req.body.userId}`;
    makeDir(path);
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});

const createUploadsEndpoints = (router, model) => {
  // const storage = createStorage(model);
  const upload = multer({ storage });

  router.get(`${storageRoute}/:bucket`, errorHandlers.catchErrors(async (req, res) => {
    model.find({ bucket: req.params.bucket })
      .then((docs) => {
        return res.json({ docs });
      });
  }));

  router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;
    const fileData = {
      userId: req.body.userId,
      filename: req.body.filename,
      bucket: req.body.bucket,
    };

    const metadata = await saveMetadata(fileData, model);
    console.log(metadata['_id'].toString());

    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      // return next(error);
    }
    res.json({ metadata });
  }));
};

export default createUploadsEndpoints;
