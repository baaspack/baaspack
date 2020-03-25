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

const saveMetadata = (metadata, model) => {
  model.find({ filename: metadata.filename, userId: metadata.userId, bucket: metadata.bucket })
    .then((documents) => {
      if (documents.length === 0) {
        console.log('saving metadata')
        model.create(metadata)
          .then((resource) => {
            // this isn't accessible in filename or route
            // req.body.id = resource['_id'].toString();
            console.log(resource);
          });
      }
    });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    makeDir(`${storagePath}/${req.body.bucket}`);
    cb(null, `${storagePath}/${req.body.bucket}`);
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

    saveMetadata(fileData, model);

    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      // return next(error);
    }
    res.json({ fileData });
  }));
};

export default createUploadsEndpoints;
