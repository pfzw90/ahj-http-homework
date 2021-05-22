const fs = require('fs');
const Ticket = require('./ticket');
const TicketFull = require('./ticketFull');
const jsonReader = require('./jsonReader');
const generateUniqueId = require('./generateUniqueId');

module.exports = class TicketManager {
  constructor() {
    jsonReader('./tickets.json', (err, tickets) => {
      if (err) {
        throw new Error(err);
      }
      this.ticketList = tickets;
    });
  }

  refreshStorage() {
    fs.writeFile('./tickets.json', JSON.stringify(this.ticketList), (err) => {
      if (err) throw new Error(err);
    });
  }

  getTickets() {
    const result = [];
    this.ticketList.forEach((ticket) => {
      result.push(new Ticket(...Object.values(ticket)));
    });
    return result;
  }

  getTicketFull(query) {
    const tick = new TicketFull(
      ...Object.values(this.ticketList.find((ticket) => (`${ticket.id}` === query.id))),
    );
    return tick;
  }

  createTicket(data) {
    const id = generateUniqueId(this.ticketList);
    this.ticketList.push(new TicketFull(id, data.name, undefined, undefined, data.description));
    this.refreshStorage();
    return 'Created';
  }

  updateTicket(data) {
    const result = {};
    this.ticketList = this.ticketList.map((ticket) => {
      if (`${ticket.id}` === data.id) {
        Object.defineProperty(ticket, 'name', { value: data.name || ticket.name });
        result.name = data.name || ticket.name;
        Object.defineProperty(ticket, 'description', { value: data.description || ticket.description });
        result.description = data.description || ticket.description;
      }
      return ticket;
    });
    this.refreshStorage();
    return result;
  }

  updateStatus(data) {
    this.ticketList = this.ticketList.map((ticket) => {
      if (`${ticket.id}` === data.id) {
        let status = false;
        if (data.status === 'true') status = true;
        Object.defineProperty(ticket, 'status', { value: status });
      }
      return ticket;
    });
    this.refreshStorage();
    return 'Status updated';
  }

  deleteTicket(data) {
    this.ticketList.splice(this.ticketList.findIndex((ticket) => (`${ticket.id}` === data.id)), 1);
    this.refreshStorage();
    return 'Deleted';
  }
};
