const Ticket = require('./ticket');
const TicketFull = require('./ticketFull');

module.exports = class TicketMaker {
  constructor() {
    this.types = {
      ticketShort: Ticket,
      ticketFull: TicketFull,
    };
  }

  getTickets(tickets, type) {
    const Constructor = this.types[type];
    const result = [];
    if (Constructor) {
      tickets.forEach((ticket) => {
        result.push(new Constructor(...Object.values(ticket)));
      });
    }
    if (type === TicketFull) return result[0];
    return result;
  }
};
