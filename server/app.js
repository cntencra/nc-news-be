const express = require("express");
const apiRouter = require("./routes/api-router.js");
const cors = require('cors');


const {
    handlePsqlErrors,
    handleCustomErrors,
    handleServerErrors
} = require("./controllers/errors.controllers.js");


const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.all('/*', (request, response) => {
    response.status(404).send({ msg: 'Path not found'});
});

app.use(handlePsqlErrors);

app.use(handleCustomErrors);

app.use(handleServerErrors);

module.exports = app;