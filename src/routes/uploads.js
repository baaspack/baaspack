import fs from 'fs';
import multer from 'multer';
import errorHandlers from '../handlers/errorHandlers';

const storagePath = './public/uploads';
const storageRoute = '/uploads';
let uploadsModel = {};

// const saveMetadata = (metadata) => {
// };

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
    const metadata = {
      bucket: req.body.bucket,
      userId: req.body.userId,
      originalFilename: file.originalname,
    };
    // Todo: save metadata and return id, set body.id 
    const resource = uploadsModel.create(metadata);
    console.log(resource)
    req.body.id = '123'

    makeDir(`${storagePath}/${req.body.userId}`);
    cb(null, `${storagePath}/${req.body.userId}`);
  },
  filename: (req, file, cb) => {
    //  TODO: change this to file name plus original name extension
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const addUploadsRoutes = (router) => {
  router.get(`${storageRoute}/:id`, errorHandlers.catchErrors(async (req, res) => {
    console.log(req.params.bucket);
    fs.readdir(`${storagePath}/${req.params.bucket}`, (err, files) => {
      if (err) {
        return err;
      }
      return res.json({ files: [...files] });
    });
  }));

  router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    // return id as json
    res.send(req.body.id);
  }));
};

const createUploadsEndpoints = (router, model) => {
  uploadsModel = model;
  addUploadsRoutes(router);
};

export default createUploadsEndpoints;
