require("dotenv").config();

const MongoProd = process.env.MONGO_PROD;

const MongoURI = MongoProd == true 
? `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=${process.env.MONGO_AUTH}`
: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`;

const SessionSecret = process.env.SESSION_SECRET || "very-secret-key";

const HttpType = process.env.HTTP_TYPE || 'http';
const Port = process.env.PORT || 3000;
const FrontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';

const config = {
    MongoProd,
    MongoURI,
    SessionSecret,
    HttpType,
    Port,
    FrontendURL,
}

module.exports = config;