import fs from 'fs';
import multer from 'multer';
import errorHandlers from '../handlers/errorHandlers';
import { checkAuthenticated } from '../handlers/authorization';

const storagePath = './public/uploads';
const storageRoute = '/uploads';

const getFileData = (req) => {
  const fileData = {
    userId: req.user.id,
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
    const oldName = `${storagePath}/${req.session.passport.user}/${metadata.filename}`;
    const newName = `${storagePath}/${req.session.passport.user}/${req.body.filename}`;

    fs.rename(oldName, newName, ((err) => {
      console.log(err);
    }));
  }

  return req.body.filename;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const path = `${storagePath}/${req.user.id}`;
    await makeDir(path);
    cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file && req.body.filename) {
      cb(null, true);
    } else {
      cb(new Error('Body must include file and filename'));
    }
  },
});

const createUploadsEndpoints = (router, model) => {
  const checkFileExists = (req, res, next) => {
    return (async () => {
      const metadata = await getRecord(model, req.params.filename, req.user.id);
      const id = await getIdFromRecord(metadata);

      if (!id) {
        return res.status(404).send({ message: 'file does not exist' });
      }

      next();
    })();
  };

  router.get(`${storageRoute}/:userId`, checkAuthenticated, errorHandlers.catchErrors(async (req, res) => {
    model.find({ userId: req.params.userId })
      .then((records) => {
        return res.json({ records });
      });
  }));

  router.post(`${storageRoute}`, checkAuthenticated, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;

    if (!file) {
      return res.status(400).send({ message: 'no file uploaded' });
    }

    const fileData = await getFileData(req);
    const record = await getRecord(model, req.body.filename, req.user.id);
    const id = await getIdFromRecord(record);

    if (id) {
      return res.status(400).send({ message: 'file already exists' });
    }
    const metadata = await saveMetadata(fileData, model);

    return res.json(metadata);
  }));

  router.delete(`${storageRoute}/:filename`, checkAuthenticated, errorHandlers.catchErrors(async (req, res) => {
    const record = await getRecord(model, req.params.filename, req.user.id);
    const id = await getIdFromRecord(record);
    if (!id) {
      return res.json({ message: 'record does not exist' });
    }
    const deletedRecord = await model.delete(id);

    fs.unlink(`${storagePath}/${req.user.id}/${req.params.filename}`, (err) => {
      console.log(err);
    });

    res.json({ deletedRecord });
  }));

  router.patch(`${storageRoute}/:filename`, checkFileExists, checkAuthenticated, upload.none(), errorHandlers.catchErrors(async (req, res) => {
    const metadata = await getRecord(model, req.params.filename, req.user.id);
    const id = await getIdFromRecord(metadata);
    const fileData = getFileData(req);
    const record = await model.patch(id, { filename: fileData.filename, bucket: fileData.bucket });

    updateFilename(metadata, req);

    res.json({ record });
  }));

  router.put(`${storageRoute}/:filename`, checkFileExists, checkAuthenticated, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
    const { file } = req;

    if (!file) {
      res.json({ message: 'no file' });
      return;
    }

    res.json({ message: 'file overwritten' });
  }));
};

export default createUploadsEndpoints;
