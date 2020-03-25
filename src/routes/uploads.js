// import fs from 'fs';
// import multer from 'multer';
// import errorHandlers from '../handlers/errorHandlers';

// const storagePath = './public/uploads';
// const storageRoute = '/uploads';
// let uploadsModel = {};

// const makeDir = (directory) => {
//   try {
//     fs.statSync(directory);
//   } catch (e) {
//     fs.mkdir(directory, { recursive: true }, (e) => {
//       console.log('directory created');
//       if (e) throw e;
//     });
//   }
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const metadata = {
//       bucket: req.body.bucket,
//       userId: req.body.userId,
//       filename: file.originalname,
//     };

//     uploadsModel.create(metadata)
//       .then((resource) => {
//         req.body.id = resource['_id'].toString();
//         console.log(req.body.id);
//         console.log(typeof req.body.id);
//       });

//     makeDir(`${storagePath}/${req.body.userId}`);
//     cb(null, `${storagePath}/${req.body.userId}`);
//   },
//   filename: (req, file, cb) => {
//     //  TODO: change this to file name plus original name extension
//     // What information do we have access to here? I can't seem to access body.id
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage });

// const addUploadsRoutes = (router) => {
//   router.get(`${storageRoute}/:id`, errorHandlers.catchErrors(async (req, res) => {
//     console.log(req.params.bucket);
//     fs.readdir(`${storagePath}/${req.params.bucket}`, (err, files) => {
//       if (err) {
//         return err;
//       }
//       return res.json({ files: [...files] });
//     });
//   }));

//   router.post(`${storageRoute}`, upload.single('file'), errorHandlers.catchErrors(async (req, res) => {
//     const { file } = req;
//     if (!file) {
//       const error = new Error('Please upload a file');
//       error.httpStatusCode = 400;
//       return next(error);
//     }
//     // this is currently returning an empty object
//     res.json({ resourceId: req.body.id });
//   }));
// };

// const createUploadsEndpoints = (router, model) => {
//   uploadsModel = model;
//   addUploadsRoutes(router);
// };

// export default createUploadsEndpoints;


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

const createUploadsEndpoints = (router, model) => {

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const metadata = {
        bucket: req.body.bucket,
        userId: req.body.userId,
        filename: file.originalname,
      };

      model.create(metadata)
        .then((resource) => {
          req.body.id = resource['_id'].toString();
          console.log(req.body.id);
          console.log(typeof req.body.id);
        });

      makeDir(`${storagePath}/${req.body.userId}`);
      cb(null, `${storagePath}/${req.body.userId}`);
    },
    filename: (req, file, cb) => {
      //  TODO: change this to file name plus original name extension
      // What information do we have access to here? I can't seem to access body.id
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });

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
    // this is currently returning an empty object
    res.json({ resourceName: file.originalname });
  }));
};

export default createUploadsEndpoints;
