const endpointsJson = require("../server/endpoints.json");
const request = require("supertest")
const app = require("../server/app")
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("ANY /notapath", () => {
  test("404: responds with error message when path is not found", () => {
    return request(app)
      .get("/notapath")
      .expect(404)
      .then(( {body} ) => {
        expect(body.msg).toBe('Path not found')
      })
  })

})