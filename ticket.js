module.exports = class Ticket {
  constructor(id, name, created, status) {
    this.id = id;
    this.name = name;
    this.created = created || `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    this.status = status || false;
  }
};
