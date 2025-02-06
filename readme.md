### env variables

- `ATLAS_CONNECTION_STRING`
- `HUGGING_FACE_ACCESS_TOKEN`

### Scripts you should run in this order:

- `node --env-file=.env ingest-data.js`
- `node --env-file=.env rag-vector-index.js`
- `node --env-file=.env retrieve-documents-test.js`
- `node --env-file=.env generate-responses.js`

### references

https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/#get-started
