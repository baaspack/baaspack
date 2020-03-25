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

const createStorage = (model) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const metadata = {
        bucket: req.body.bucket,
        userId: req.body.userId,
        filename: file.originalname,
      };
      // Check to see if metadata record already exists. If it does, don't save it again.
      // File system does not save multiple copies of same name, but db will otherwise.
      model.find({ filename: metadata.filename, userId: metadata.userId })
        .then((documents) => {
          if (documents.length === 0) {
            console.log('saving metadata')
            model.create(metadata)
              .then((resource) => {
                // this isn't accessible in filename or route
                req.body.id = resource['_id'].toString();
              });
          }
        });

      makeDir(`${storagePath}/${req.body.bucket}`);
      cb(null, `${storagePath}/${req.body.bucket}`);
    },
    filename: (req, file, cb) => {
      //  TODO: should we give it some other name? can't access mongo id from here.
      cb(null, file.originalname);
    },
  });
};

const createUploadsEndpoints = (router, model) => {
  const storage = createStorage(model);
  const upload = multer({ storage });

  router.get(`${storageRoute}/:bucket`, errorHandlers.catchErrors(async (req, res) => {
    model.find({ bucket: req.params.bucket })
      .then((docs) => {
        return res.json({ docs });
      });
  }));

  router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      // return next(error);
    }
    res.json({ resourceName: file.originalname });
  }));
};

export default createUploadsEndpoints;
