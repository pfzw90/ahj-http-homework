const baseUrl = 'http://localhost:7070/';
module.exports = function sendRequest(object, method, options, callbackfn, data = new FormData()) {
  const params = new URLSearchParams();
  params.set('method', options.method);
  if (object.className === 'ticket') {
    params.set('id', object.id);
    data.set('id', object.id);
    data.set('method', options.method);
   }

  const req = new XMLHttpRequest();

  req.addEventListener('load', () => {
    if (req.status >= 200 && req.status < 300) {
      try {
        const result = JSON.parse(req.responseText);
        if (callbackfn) callbackfn.call(this, result.data);
      } catch (e) {
        throw new Error(e);
      }
    }
  });

  req.open(method, `${baseUrl}?${params}`, true);
  if (method !== 'GET') {
    req.send(data);
  }
  else req.send();
};
