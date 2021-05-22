/* eslint-disable no-unused-vars */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const TicketManager = require('./ticketManager');

const port = process.env.PORT || 7070;

const ticketManager = new TicketManager();
const app = new Koa();
app.use(koaBody({ urlencoded: true, multipart: true }));

app.use(async (ctx, next) => { const origin = ctx.request.get('Origin'); if (!origin) { return await next(); } const headers = { 'Access-Control-Allow-Origin': '*' }; if (ctx.request.method !== 'OPTIONS') { ctx.response.set({ ...headers }); try { return await next(); } catch (e) { e.headers = { ...e.headers, ...headers }; throw e; } } if (ctx.request.get('Access-Control-Request-Method')) { ctx.response.set({ ...headers, 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH' }); if (ctx.request.get('Access-Control-Request-Headers')) { ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers')); } ctx.response.status = 204; } });

app.use(async (ctx) => {
  let method;
  if (ctx.request.method === 'GET') {
    ({ method } = ctx.request.query);
  } else if (ctx.request.method === 'POST') ({ method } = ctx.request.body);

  const response = {
    success: true,
    data: '',
  };

  switch (method) {
    case 'allTickets': response.data = ticketManager.getTickets();
      break;
    case 'ticketById': response.data = ticketManager.getTicketFull(ctx.request.query);
      break;
    case 'createTicket': response.data = ticketManager.createTicket(ctx.request.body);
      break;
    case 'changeStatus': response.data = ticketManager.updateStatus(ctx.request.body);
      break;
    case 'updateTicket': response.data = ticketManager.updateTicket(ctx.request.body);
      break;
    case 'deleteTicket': response.data = ticketManager.deleteTicket(ctx.request.body);
      break;
    default:
      response.success = false;
      response.data = `Unknown method '${method}' in request parameters`;
  }

  ctx.body = JSON.stringify(response);
});

const server = http.createServer(app.callback()).listen(port);
