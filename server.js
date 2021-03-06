const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware').errorHandler;

app.use(cors());

app.use(bodyParser.json());

app.get('/clients',routes.clients.getByEmailValidator,routes.clients.getByEmail);

app.get('/clients/:id',routes.clients.getValidator,routes.clients.get);

app.post('/clients',routes.clients.createValidator,routes.clients.create);

app.put('/clients/:id',routes.clients.setValidator,routes.clients.set);

app.get('/establishments',routes.establishments.getByFilterValidator,routes.establishments.getByFilter);

app.get('/establishments/:id',routes.establishments.getValidator,routes.establishments.get);

app.get('/establishment',routes.establishments.getByEmailValidator,routes.establishments.getByEmail);

app.post('/establishments',routes.establishments.createValidator,routes.establishments.create);

app.put('/establishments/:id',routes.establishments.setValidator,routes.establishments.set);

app.post('/establishments/:id/messages',routes.establishments.addMessageValidator,routes.establishments.addMessage);

app.use(errorHandler);

app.listen(3001);