const endpointsJson = require("../server/endpoints.json");
const request = require("supertest")
const app = require("../server/app")
const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const testData = require("../db/data/test-data/index")

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

describe("GET /api/articles/:article_id", () => {
  test("200: responds with an article when provided a valid article_id", () => {
    return request(app).get(`/api/articles/13`)
    .expect(200)
    .then((response) => {
      const { article_id, author, topic, title, body, created_at, votes, article_img_url } = response.body.article;
      expect(article_id).toBe(13);
      expect(typeof author).toBe('string');
      expect(typeof topic).toBe('string');
      expect(typeof title).toBe('string');
      expect(typeof body).toBe('string');
      expect(typeof created_at).toBe('string');
      expect(typeof votes).toBe('number');
      expect(typeof article_img_url).toBe('string');
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated content", () => {
    return request(app).get(`/api/articles/9999`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });

  });
  test("400: responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).get(`/api/articles/bananana`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });

  });

});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app).get(`/api/articles`)
    .expect(200)
    .then(({ body }) => {
      expect(body.articles.length).toBe(13)
      body.articles.forEach((article) => {
        const { article_id, author, topic, title, created_at, votes, article_img_url, comment_count, body } = article;
        expect(typeof article_id).toBe('number');
        expect(typeof author).toBe('string');
        expect(typeof topic).toBe('string');
        expect(typeof title).toBe('string');
        expect(typeof created_at).toBe('string');
        expect(typeof votes).toBe('number');
        expect(typeof article_img_url).toBe('string');
        expect(typeof comment_count).toBe('number');
        expect(body).toBe(undefined);
      });

      expect(body.articles).toBeSortedBy('created_at',{ descending: true })
    });
  });
});