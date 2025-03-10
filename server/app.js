const express = require("express");
const endpointsJson = require("./endpoints.json")

const {
    handleServerErrors
} = require("./controllers/errors.controllers.js")

const app = express()

app.get(`/api`, (request, response) => {
    response.status(200).send({ endpoints: endpointsJson })
});


app.all('/*', (request, response) => {
    response.status(404).send({ msg: 'Path not found'})
})

app.use(handleServerErrors);

module.exports = app;