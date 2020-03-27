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
  try {
    const data = { filename: metadata.filename, userId: metadata.userId, bucket: metadata.bucket };
    const documents = await model.find(data);
    if (documents.length === 0) {
      return model.create(metadata);
    }
  } catch (err) {
    return ({ error: 'File already exists' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const path = `${storagePath}/${req.body.userId}`;
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});

const createUploadsEndpoints = (router, model) => {
  const upload = multer({ storage });

  router.get(`${storageRoute}/:userId`, errorHandlers.catchErrors(async (req, res) => {
    model.find({ userId: req.params.userId })
      .then((docs) => {
        return res.json({ docs });
      });
  }));

  router.get(`${storageRoute}/:userId`, errorHandlers.catchErrors(async (req, res) => {
    model.find({ userId: req.params.userId })
      .then((docs) => {
        return res.json({ docs });
      });
  }));

  router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;

    if (!file) {
      res.json({ error: 'no file' });
      return;
    }
    res.json({ message: 'file saved' });
  }));

  router.post(`${storageRoute}/metadata`, upload.none(), errorHandlers.catchErrors(async (req, res) => {
    const fileData = {
      userId: req.body.userId,
      filename: req.body.filename,
      bucket: req.body.bucket,
    };

    const existingRecord = await model.find({ userId: req.body.userId, filename: req.body.filename });

    if (existingRecord.length > 0) {
      res.status(400).send('record already exists')
      return;
    }
    const metadata = await saveMetadata(fileData, model);
    const path = `${storagePath}/${req.body.userId}`;
    makeDir(path);

    res.status(200).send('success!');
  }));

  // Handle ERRRorrrrssss!!!!
  router.delete(`${storageRoute}/:userId/:filename`, errorHandlers.catchErrors(async (req, res) => {
    const metadata = await model.find({ userId: req.params.userId, filename: req.params.filename });
    const id = metadata[0]['_id'].toString();
    const deletedRecord = await model.delete(id);

    fs.unlink(`${storagePath}/${req.params.userId}/${req.params.filename}`, (err) => {
      console.log(err)
    });

    res.json({ deletedRecord });
  }));

  // This method is just to update metadata and filename. It doesn't relace the file.
  router.patch(`${storageRoute}/:userId/:filename`, upload.none(), errorHandlers.catchErrors(async (req, res) => {
    const metadata = await model.find({ userId: req.params.userId, filename: req.params.filename });
    const id = metadata[0]['_id'].toString();

    // if it is the filename that should be changed, change it in the filesystem
    if (metadata[0].filename !== req.body.filename) {
      const oldName = `${storagePath}/${req.params.userId}/${metadata[0].filename}`;
      const newName = `${storagePath}/${req.params.userId}/${req.body.filename}`;
      fs.rename(oldName, newName, ((err) => {
        console.log(err);
      }));
    }
    // update all metadata
    const fileData = {
      filename: req.body.filename,
      bucket: req.body.bucket,
    };
    const record = await model.patch(id, fileData);

    res.json({ record });
  }));
  // this endpoint overwrites file
  // errors: 
  router.put(`${storageRoute}/:userId/:filename`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;
    console.log(req.body);
    if (!file) {
      res.json({ error: 'no file' });
      return;
    }
    res.json({ message: 'saved' });
  }));

};

export default createUploadsEndpoints;
