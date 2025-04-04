# NC News

[NC news hosted by render](https://chris-nc-news.onrender.com/api) 

/api details possible endpoints

GET endpoints for news site. Database contains tables
- articles \
/api/articles \
/api/articles/:article_id
- topics \
/api/topics
- users \
/api/users
- comments \
/api/comments/:comment_id \
/api/articles/:article_id/comments

## Clone the repo
```bash
cd ~/path_to_dir/

git clone https://github.com/user/nc-news.git
``` 
## Install dependencies, 
```bash
npm install
```

## Set up the .env.* files
```JavaScript
.env.development
    `PGDATABASE = nc_news`

.env.test
    `PGDATABASE = nc_news_test`
```

## Seed local database
```bash
npm run setup-dbs
npm run seed-dev
```
## Run tests.
```bash
npm run test
```



## Minimum versions
- Node.js v23.6.0
- Postgres v16.8
