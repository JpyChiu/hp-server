# Setup

- Local compile with `nodejs v14.17.1`
- To start the server in docker container, please run `docker-compose up -d` in background
- server url: `http://localhost:4000/file/:localSystemFilePath`

# Folder Structure

note: Please do the file modification under `dest/` to avoid server crashes. You can still access any files with `GET` method

```
.
├── dest // file storage folder
├── src
│   ├── router
│       ├── files.ts
│   ├── index.ts
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

# TODO

- [x] create file api
- [x] get file api
- [x] support query
- [x] update file api
- [x] delete file api
- [x] docker
- [ ] unit test
