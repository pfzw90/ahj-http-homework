const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const fs = require('fs');
const jsonReader = require('./jsonReader');
const generateUniqueId = require('./generateUniqueId');
const TicketMaker = require('./ticketMaker');
const TicketFull = require('./ticketFull');

const port = 7070;
const ticketMaker = new TicketMaker();
let ticketList = [];

jsonReader('./tickets.json', (err, tickets) => {
  if (err) {
    throw new Error(err);
  }
  ticketList = tickets;
});

const app = new Koa();
app.use(koaBody({ urlencoded: true }));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }
  const headers = { 'Access-Control-Allow-Origin': '*' };
  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }
  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });
    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});

app.use(async (ctx) => {
  const { method } = ctx.request.query;
  let { id } = ctx.request.query;
  switch (method) {
    case 'allTickets':
      ctx.response.body = ticketMaker.getTickets(ticketList, 'ticketShort');
      return;
    case 'ticketById':
      ctx.response.body = ticketMaker.getTickets(ticketList.filter((ticket) => `${ticket.id}` === ctx.request.query.id), 'ticketFull');
      return;
    case 'createTicket':
      if (!id) {
        id = generateUniqueId(ticketList);
        ticketList.push(new TicketFull(
          id, { ...ctx.request.body },
        ));
      } else {
        Object.entries(ctx.request.body)
          .forEach(([key, value]) => {
            if (value !== undefined) {
              ticketList.map((t, i) => {
                if (`${t.id}` === id) {
                  ticketList[i][key] = value;
                }
                return t;
              });
            }
          });
      }
      console.log(ticketList);

      fs.writeFile('./tickets.json', JSON.stringify(ticketList), (err) => {
        if (err) throw new Error(err);
      });
      ctx.response.body = JSON.stringify('Ok');
      ctx.response.status = 200;
      return;

    case 'deleteTicket':
      ticketList.splice(ticketList.findIndex((el) => (`${el.id}` === id)), 1);

      fs.writeFile('./tickets.json', JSON.stringify(ticketList), (err) => {
        if (err) throw new Error(err);
      });
      ctx.response.body = JSON.stringify('Ok');
      ctx.response.status = 200;
      return;

    default:
      ctx.response.status = 404;
  }
});

const server = http.createServer(app.callback()).listen(7070);
