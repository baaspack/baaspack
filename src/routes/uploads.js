import fs from 'fs';
import multer from 'multer';
import errorHandlers from '../handlers/errorHandlers';

const storagePath = './public/uploads';
const storageRoute = '/uploads';

const getFileData = (req) => {
  const fileData = {
    userId: req.body.userId,
    filename: req.body.filename,
    bucket: req.body.bucket,
  };
  return fileData;
};

const getRecord = async (model, filename, userId) => {
  const record = await model.find({ userId, filename });
  return record[0] || null;
};

const getIdFromRecord = (record) => {
  if (record) {
    return record['_id'].toString();
  }
};

const makeDir = (directory) => {
  fs.mkdirSync(directory, { recursive: true });
};

const saveMetadata = async (metadata, model) => {
  try {
    const data = { filename: metadata.filename, userId: metadata.userId, bucket: metadata.bucket };
    const documents = await model.find(data);

    if (documents.length === 0) {
      return model.create(metadata);
    }
  } catch (err) {
    return ({ error: err });
  }
};

const updateFilename = async (metadata, req) => {
  if (metadata.filename !== req.body.filename) {
    const oldName = `${storagePath}/${req.params.userId}/${metadata.filename}`;
    const newName = `${storagePath}/${req.params.userId}/${req.body.filename}`;

    fs.rename(oldName, newName, ((err) => {
      console.log(err);
    }));
  }

  return req.body.filename;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const path = `${storagePath}/${req.body.userId}`;
    await makeDir(path);
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});

const upload = multer({ storage });

const createUploadsEndpoints = (router, model) => {
  router.get(`${storageRoute}/:userId`, errorHandlers.catchErrors(async (req, res) => {
    model.find({ userId: req.params.userId })
      .then((docs) => {
        return res.json({ docs });
      });
  }));

  router.post(`${storageRoute}/:userId`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;

    if (!file) {
      return res.status(400).send({ message: 'no file uploaded' });
    }

    const fileData = await getFileData(req);
    const record = await getRecord(model, req.body.filename, req.body.userId);
    const id = await getIdFromRecord(record);

    if (id) {
      const updatedRecord = await model.patch(id, fileData);
      return res.json({ updatedRecord });
    }
    const metadata = await saveMetadata(fileData, model);

    return res.json(metadata);
  }));

  router.delete(`${storageRoute}/:userId/:filename`, errorHandlers.catchErrors(async (req, res) => {
    const record = await getRecord(model, req.params.filename, req.params.userId);
    const id = await getIdFromRecord(record);
    const deletedRecord = await model.delete(id);

    fs.unlink(`${storagePath}/${req.params.userId}/${req.params.filename}`, (err) => {
      console.log(err);
    });

    res.json({ deletedRecord });
  }));

  // Update metadata and filename. Does not relace the file.
  router.patch(`${storageRoute}/:userId/:filename`, upload.none(), errorHandlers.catchErrors(async (req, res) => {
    const metadata = await getRecord(model, req.params.filename, req.params.userId);
    const id = await getIdFromRecord(metadata);
    const fileData = getFileData(req);
    const record = await model.patch(id, { filename: fileData.filename, bucket: fileData.bucket });

    updateFilename(metadata, req);

    res.json({ record });
  }));
  // overwrites file
  router.put(`${storageRoute}/:userId/:filename`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;

    if (!file) {
      res.json({ message: 'no file' });
      return;
    }

    res.json({ message: 'file overwritten' });
  }));

};

export default createUploadsEndpoints;
