const sendRequest = require('./sendRequest');

module.exports = class HelpDesk {
  constructor() {
    const refresh = new CustomEvent('datarefresh');
    this.container = document.createElement('div');
    this.container.id = 'container';
    document.body.appendChild(this.container);

    this.addButtn = document.createElement('button');
    this.addButtn.className = 'add-ticket';
    this.addButtn.innerText = 'Добавить тикет ➕';
    this.container.insertAdjacentElement('afterbegin', this.addButtn);
    this.addButtn.addEventListener('click', (event) => {
      event.preventDefault();
      const editWindow = document.createElement('div');
      editWindow.className = 'modal';
      editWindow.innerHTML = `<div class="modal-content">
          <form class="edit-form">
          <label for = "name">Краткое описание</label>
          <input name ="name" value = "" placeholder="Введите название" required>
          <label for = "description">Подробное описание</label>
          <input name ="description" value = "" placeholder="Введите подробное описание" required>
          <button class = "close-modal">Отмена</button>
          <button class = "save">Добавить тикет</button>
          <form>
          </div>`;
      document.body.insertAdjacentElement('beforeend', editWindow);
      const editForm = document.querySelector('.edit-form');
      editForm.addEventListener('submit', ((evt) => {
        evt.preventDefault();
        const formData = new FormData(evt.target);
        sendRequest(document.body, 'POST', { method: 'createTicket' }, () => {
          editWindow.remove();
          document.body.dispatchEvent(refresh);
        }, formData);
      }));
      editForm.querySelector('.close-modal').addEventListener('click', (ev) => {
        ev.preventDefault();
        editWindow.remove();
      });
    });

    document.body.addEventListener('datarefresh', () => {
      document.querySelectorAll('.ticket').forEach((elem) => elem.remove());

      sendRequest(document.body, 'GET', { method: 'allTickets' }, (tickets) => {
        tickets.forEach((ticket) => {
          const tkt = document.createElement('div');
          tkt.className = 'ticket';
          tkt.id = ticket.id;
          tkt.innerHTML = `<span class = "ticket-name">${ticket.name}</span>`;
          this.container.insertAdjacentElement('beforeend', tkt);
          tkt.querySelector('.ticket-name').addEventListener('click', (e) => {
            e.preventDefault();
            const desc = document.querySelector('.ticket-description');
            if (desc && desc.closest('.ticket') === tkt) desc.remove();
            else if ((desc && desc.closest('.ticket') !== tkt) || !desc) {
              if ((desc && desc.closest('.ticket') !== tkt)) desc.remove();
              sendRequest(tkt, 'GET', { method: 'ticketById' }, (data) => {
                const descriptionTkt = document.createElement('span');
                descriptionTkt.className = 'ticket-description';
                descriptionTkt.innerText = data.description;
                tkt.insertAdjacentElement('beforeend', descriptionTkt);
                descriptionTkt.addEventListener('click', (ev) => {
                  ev.preventDefault();
                  descriptionTkt.remove();
                });
              });
            }
          });

          const finishedTicket = document.createElement('form');
          finishedTicket.className = 'ticket-finished-form';
          const isFinished = document.createElement('input');
          isFinished.type = 'checkbox';
          isFinished.className = 'is-finished';
          isFinished.name = 'status';
          isFinished.checked = ticket.status ? 'checked' : '';
          finishedTicket.appendChild(isFinished);
          tkt.insertAdjacentElement('afterbegin', finishedTicket);
          isFinished.addEventListener('change', (ev) => {
            ev.preventDefault();
            const data = new FormData();
            if (ev.target.checked) data.append('status', true);
            else data.append('status', false);
            sendRequest(tkt, 'POST', { method: 'changeStatus' }, () => { document.body.dispatchEvent(refresh); }, data);
          });

          const ticketInfo = document.createElement('div');
          ticketInfo.className = 'ticket-info';
          tkt.insertAdjacentElement('beforeend',ticketInfo)
          
          const createdTkt = document.createElement('span');
          createdTkt.className = 'ticket-created';
          createdTkt.innerText = `${ticket.created}`;
          ticketInfo.insertAdjacentElement('beforeend', createdTkt);

          const delTkt = document.createElement('span');
          delTkt.innerText = '🗑';
          delTkt.className = 'ticket-delete';
          ticketInfo.insertAdjacentElement('beforeend', delTkt);
          delTkt.addEventListener('click', (ev) => {
            ev.preventDefault();
            const editWindow = document.createElement('div');
            editWindow.className = 'modal';
            editWindow.innerHTML = `<div class="modal-content">
              <span class = "warning"> Это действие необратимо. Вы уверены, что хотите удалить тикет? </span>
              <button class = "close-modal">Отмена</button>
              <button id="delete-ticket">Удалить</button>
              </div>`;
            document.body.appendChild(editWindow)
            document.querySelector('#delete-ticket').addEventListener('click', (delEv) => {
              delEv.preventDefault();
              sendRequest(tkt, 'POST', { method: 'deleteTicket' }, () => {
                editWindow.remove();
                document.body.dispatchEvent(refresh);
              });
            });
            document.querySelector('.close-modal').addEventListener('click', (closeEv) => {
              closeEv.preventDefault();
              editWindow.remove();
            });
          });

          const editTkt = document.createElement('span');
          editTkt.className = 'ticket-edit';
          editTkt.innerText = '✎';
          ticketInfo.insertAdjacentElement('beforeend', editTkt);
          editTkt.addEventListener('click', (editEv) => {
            editEv.preventDefault();
            sendRequest(tkt, 'GET', { method: 'ticketById' }, (data) => {
              const editWindow = document.createElement('div');
              editWindow.className = 'modal';
              editWindow.innerHTML = `<div class="modal-content">
              <form class="edit-form">
              <label for = "name">Краткое описание</label>
              <input name ="name" value = "${data.name}" required>
              <label for = "description">Подробное описание</label>
              <input name ="description" value = "${data.description}" required>
              <button class = "close-modal">Отмена</button>
              <button class = "save">Сохранить</button>
              <form>
              </div>`;
              document.body.appendChild(editWindow)
              const editForm = document.querySelector('.edit-form');
              editForm.addEventListener('submit', ((ev) => {
                ev.preventDefault();
                const formData = new FormData(ev.target);
                sendRequest(tkt, 'POST', { method: 'updateTicket' }, () => {
                  editWindow.remove();
                  document.body.dispatchEvent(refresh);
                }, formData);
              }));
            });
          });
        });
      });
    });

    document.body.dispatchEvent(refresh);
  }
};
