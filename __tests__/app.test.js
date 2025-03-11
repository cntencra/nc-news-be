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
      expect(body.articles).toBeSortedBy('created_at',{ descending: true })
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
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {

  test("200: responds with an array of comments", () => {
    return request(app).get(`/api/articles/9/comments`)
    .expect(200)
    .then(({ body }) => {
      expect(body.comments.length).toBe(2)
      body.comments.forEach((comment) => {
        const { comment_id, votes, created_at, author, body, article_id } = comment;
        expect(typeof comment_id).toBe('number');
        expect(typeof votes).toBe('number');
        expect(typeof created_at).toBe('string');
        expect(typeof author).toBe('string');
        expect(typeof body).toBe('string');
        expect(article_id).toBe(9);
      });
    });
  });

  test("200: responds with an empty array when passed a valid article_id with no comments", () => {
    return request(app).get(`/api/articles/13/comments`)
    .expect(200)
    .then(({ body }) => {
      expect(body.comments).toEqual([]);
    });
  });

  test("400: responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).get(`/api/articles/bananana/comments`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });

  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article", () => {
    return request(app).get(`/api/articles/9999/comments`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });

  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: adds a comment to comment table, responds with the added comment, author is a known author", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      votes: 0,
      author: "lurker",
      body: "I have ceased to lurk"
    })
    .expect(201)
    .then((response) => {
      const { comment_id, votes, created_at, author, body, article_id } = response.body.comment;
        expect(typeof comment_id).toBe('number');
        expect(votes).toBe(0);
        expect(typeof created_at).toBe('string');
        expect(author).toBe("lurker");
        expect(body).toBe("I have ceased to lurk");
        expect(article_id).toBe(1);
    });
  });

  test("400: responds with 'Bad request' when passed an invalid article_id, article_id = bananana", () => {
    return request(app).post(`/api/articles/bananana/comments`)
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed an author that doesn't exist, {author: 'definitley not an author'}", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      votes: 100,
      author: "definitely not an author",
      body: "Don't add me"
    })
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found')
    });
  });

  test("404: responds with 'Not found' when passed an incomplete body, missing {author:'I'm missing}", () => {
    return request(app).post(`/api/articles/1/comments`)
    .send({
      body: "Don't add me"
    })
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe('Resource not found')
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article article_id = 9999 / 22", () => {
    return request(app).post(`/api/articles/22/comments`)
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("201: articles votes incremented, article returned", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : 1})
    .expect(201)
    .then((response) => {
      const { article_id, author, topic, title, body, created_at, votes, article_img_url } = response.body.article;
      expect(article_id).toBe(1);
      expect(typeof author).toBe('string');
      expect(typeof topic).toBe('string');
      expect(typeof title).toBe('string');
      expect(typeof body).toBe('string');
      expect(typeof created_at).toBe('string');
      expect(votes).toBe(101);
      expect(typeof article_img_url).toBe('string');
    });
  });

  test("201: articles votes decremented", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : -100})
    .expect(201)
    .then((response) => {
      const { votes } = response.body.article;
      expect(votes).toBe(0);
    });
  });

  test("400: increment votes by ! typeof number", () => {
    return request(app).patch(`/api/articles/1`)
    .send({ inc_votes : 'hjg'})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  })

  test("400:  article_id = bananana | responds with 'Bad request' when passed an invalid article_id", () => {
    return request(app).patch(`/api/articles/bananana`)
    .send({ inc_votes : 1})
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe('Bad request')
    });
  });

  test("404: responds with 'Not found' when passed a valid article_id with no associated article article_id = 9999 / 22", () => {
    return request(app).patch(`/api/articles/22`)
    .send({ inc_votes : 1})
    .expect(404)
    .then(( { body }) => {
      expect(body.msg).toBe("Resource not found")
    });
  });
});