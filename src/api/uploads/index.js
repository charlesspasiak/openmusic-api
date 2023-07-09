// const routes = require('./routes');
// const UploadsHandler = require('./handler');

// module.exports = {
//   name: 'uploads',
//   version: '1.0.0',
//   register: async (server, { service, validator }) => {
//     const uploadsHandler = new UploadsHandler(service, validator);

//     server.route(routes(uploadsHandler));
//   },
// };

const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '0.0.1',
  register: async (server, { service, validator }) => {
    const uploadsHandler = new UploadsHandler(service, validator);
    server.route(routes(uploadsHandler));
  },
};
