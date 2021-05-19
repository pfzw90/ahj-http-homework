module.exports = function generateUniqueId(tickets) {
  const ids = [];
  tickets.forEach((ticket) => ids.push(ticket.id));
  let rand = 1000;
  while (ids.includes(rand)) {
    rand = Math.floor(Math.random() * 9000) + 1000;
  }
  return rand;
};
