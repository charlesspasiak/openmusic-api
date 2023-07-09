// const routes = (handler) => [
//   {
//     method: 'POST',
//     path: '/albums/{id}/covers',
//     handler: handler.postAlbumsCoverHandler,
//     options: {
//       payload: {
//         maxBytes: 512000,
//         allow: 'multipart/form-data',
//         multipart: true,
//         output: 'stream',
//       },
//     },
//   },
// ];

// module.exports = routes;

const { resolve } = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        maxBytes: 512000,
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/{param*}',
    handler: {
      directory: {
        path: resolve(__dirname, 'file'),
      },
    },
  },
];

module.exports = routes;
