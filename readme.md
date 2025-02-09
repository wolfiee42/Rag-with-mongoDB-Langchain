### env variables

- `ATLAS_CONNECTION_STRING`
- `HUGGING_FACE_ACCESS_TOKEN`

### Scripts you should run in this order:

- `node --env-file=.env 01.ingest-data.js`
- `node --env-file=.env 03.rag-vector-index.js`
- `node --env-file=.env 04.retrieve-documents-test.js`
- `node --env-file=.env 06.generate-responses.js`

### references

https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/#get-started
