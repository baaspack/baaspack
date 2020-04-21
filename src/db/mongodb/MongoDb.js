import { MongoClient } from 'mongodb';

const client = new MongoClient();

MongoClient.connect = ({ serverUrl, DbName }) => {

};

const serverConnection = new MongoClient(
  process.env.SERVER_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

serverConnection.connect();
