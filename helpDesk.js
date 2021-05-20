const Ticket = require('./ticket');
const TicketFull = require('./ticketFull');
const sendRequest = require('./sendRequest');

module.exports = class HelpDesk {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'container';
    document.body.appendChild(this.container);
    this.refresh();
  }

  refresh() {
    sendRequest(document.body, 'GET', { method: 'allTickets' }, this.drawTickets);
  }

  drawTickets(tickets) {
    tickets.forEach((ticket) => {
      const tktContainer = document.createElement('div');
      tktContainer.className = 'ticket-container';

      const tkt = document.createElement('div');
      tkt.className = 'ticket';
      tkt.id = ticket.id;
      tkt.innerText = ticket.id;

      this.container.insertAdjacentElement('beforeend', tktContainer);
      tktContainer.insertAdjacentElement('beforeend',tkt)
      tkt.addEventListener('click', (ev) => {
        ev.preventDefault();
        const desc = document.querySelector('.ticket-description');
        if (desc && desc.closest('.tkt') !== tkt) desc.remove();
        if (!desc || (desc && desc.closest('.tkt') !== tkt)) {
          sendRequest(tkt, 'GET', { method: 'ticketById' }, (data) => {
            const descriptionTkt = document.createElement('span');
            descriptionTkt.className = 'ticket-description';
            descriptionTkt.innerText = data[0].description;
            tkt.insertAdjacentElement('afterend', descriptionTkt);
            descriptionTkt.addEventListener('click', (ev) => {
              ev.preventDefault();
              descriptionTkt.remove();
            });
          });
        }
      });

      const delTkt = document.createElement('span');
      delTkt.innerText = '🗑';
      delTkt.className = 'ticket-delete';
      tkt.insertAdjacentElement('afterend', delTkt);
      delTkt.addEventListener('click', (ev) => {
        ev.preventDefault();
        sendRequest(tkt, 'POST', { method: 'deleteTicket' }, () => {console.log('deletasd')});
        tkt.closest('.ticket-container').querySelector('.ticket-delete').remove();
        tkt.closest('.ticket-container').querySelector('.ticket-edit').remove();
        tkt.remove();
      });

      const editTkt = document.createElement('span');
      editTkt.className = 'ticket-edit';
      editTkt.innerText = '✎';
      tkt.insertAdjacentElement('afterend', editTkt);
      editTkt.addEventListener('click', (ev) => {
        ev.preventDefault();
        sendRequest(tkt, 'GET', { method: 'ticketById' }, (data) => {
          const editWindow = document.createElement('div');
          const ticketData = data[0];
          editWindow.className = 'modal';
          editWindow.innerHTML = `<div class="modal-content">
          <form class="edit-form">
          <label for = "name">Краткое описание</label>
          <input name ="name" value = "${ticketData.name}">
          <label for = "description">Подробное описание</label>
          <input name ="description" value = "${ticketData.description}">
          <button class = "close-modal">Отмена</button>
          <button class = "save">Сохранить</button>
          <form>
          </div>`;
        tkt.insertAdjacentElement('afterend', editWindow);
          const editForm = document.querySelector('.edit-form');
           editForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const formData = new FormData(ev.target);
            console.log(formData.get('description'))
            sendRequest(tkt, 'POST', { method: 'createTicket' }, undefined, formData);


          })



        });


        const editForm = document.createElement('div');
        editForm.className = 'modal';
        editForm.innerHTML = `<div class="modal-content">
        <span class="close">&times;</span>
        <form class="edit-form">
        <input name ="name" value = "
        <form>
      </div>`;

    
      })

      

    });
  }
};
