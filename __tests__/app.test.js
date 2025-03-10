const endpointsJson = require("../server/endpoints.json");
const request = require("supertest")
const app = require("../server/app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const testData = require("../db/data/test-data")

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  db.end();
});

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
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topics", () => {
    return request(app).get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics.length).toBe(3)
        body.topics.forEach((topic) => {
          const { slug, description } = topic;
          expect(typeof slug).toBe('string');
          expect(typeof description).toBe('string');
        });
      });
  });
});