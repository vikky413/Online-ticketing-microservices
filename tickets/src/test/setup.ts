import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

//declare signup function a global helper for testing
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}
// declare so each hook has access
let mongo: any;
// hook function run before all tests
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfadsf';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// run before each test, delete all collections
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// after all tests are complete stop and close mongoose db
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  // build jwt payload. {id, email}
  const payload = {
    id: 'asdfasdf',
    email: 'test@test.com',
  };
  // create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build up session object { jwt: MY_JWT}
  const session = { jwt: token };
  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON  and encdoe it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};