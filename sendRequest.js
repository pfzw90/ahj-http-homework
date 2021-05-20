const baseUrl = 'http://localhost:7070/';
module.exports = function sendRequest(object, method, options, callbackfn, data) {
  const req = new XMLHttpRequest();
  const params = new URLSearchParams();
  params.append('method', options.method);
  if (object.className === 'ticket') params.append('id', object.id);
  req.open(method, `${baseUrl}?${params}`);
  if (data) req.send(data);
  else req.send();

  req.addEventListener('load', () => {
    if (req.status >= 200 && req.status < 300) {
      try {
        const result = JSON.parse(req.responseText);
        if (callbackfn) callbackfn.call(this, result);
      } catch (e) {
        throw new Error(e);
      }
    }
  });


};
