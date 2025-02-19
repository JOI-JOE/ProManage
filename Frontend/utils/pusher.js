
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: '011ba3f5ec97a6948d45',
  cluster: 'ap1',
  forceTLS: true
});
