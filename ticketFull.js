const Ticket = require('./ticket');

module.exports = class TicketFull extends Ticket {
  constructor(id, name, created, status, description) {
    super(id, name, created, status);
    this.description = description;
  }
};
