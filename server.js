const app = require('express')();
const bodyParser = require('body-parser');
const routes = require('./routes');
const errorHandler = require('./middleware').errorHandler;

app.use(bodyParser.json());

app.get('/clients/:id',routes.clients.getValidator,routes.clients.get);

app.post('/clients',routes.clients.createValidator,routes.clients.create);

app.put('/clients/:id',routes.clients.setValidator,routes.clients.set);

app.get('/establishments',routes.establishments.getByFilterValidator,routes.establishments.getByFilter);

app.get('/establishments/:id',routes.establishments.getValidator,routes.establishments.get);

app.post('/establishments',routes.establishments.createValidator,routes.establishments.create);

app.put('/establishments/:id',routes.establishments.setValidator,routes.establishments.set);

app.post('/establishments/:id/messages',routes.establishments.addMessageValidator,routes.establishments.addMessage);

app.use(errorHandler);

app.listen(3000);