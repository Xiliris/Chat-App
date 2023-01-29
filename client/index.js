const socket = io('ws://localhost:8080');
/* HOME */
let home = document.getElementById('home');
let usernameField = document.getElementById('username');
let roomField = document.getElementById('room');
let btn = document.getElementById('join');
let username = '';
let roomId = '';

/* CHAT */
let display = document.getElementById('display');
let messageArea = document.getElementById('message');
let send = document.getElementById('send');
let usersList = document.getElementById('users-list');
let spam = false;
let lastUserMessage = '';

send.addEventListener('click', () => {
  sendMessage();
});

document.onkeydown = (e) => {
  if (home.style.display !== 'none') return;
  if (e.key !== 'Enter') return;
  if (!messageArea.value) {
    messageArea.focus();
  } else {
    sendMessage();
  }
};

/* SOCKET EVENTS */

socket.on('message', (e) => {
  let { user, msg } = e;
  createPerson(msg, user);
});

socket.on('join', (e) => {
  console.log(`${e} has joined your room`);
});

socket.on('left', (e) => {
  console.log(`${e} has left your room`);
});

socket.on('update-list', (e) => {
  updateList(e);
});

/* FUNCTIONS */

function sendMessage() {
  let message = messageArea.value;
  if (!message) return;
  if (spam === true) return;

  createYours(message);
  checkSpam();
}

function createYours(msg) {
  let client = document.createElement('div');
  let lastMsg = display.lastElementChild;
  client.className = 'client';

  if (!lastMsg || lastMsg.className !== 'client') {
    client.innerHTML = '<h3>You</h3>';
  }

  client.innerHTML += `<p>${msg}</p>`;

  display.appendChild(client);
  messageArea.value = '';

  socket.emit('message', { user: username, room: roomId, msg: msg });
}

function createPerson(msg, user) {
  let server = document.createElement('div');
  server.className = `server ${user}`;
  let lastMsg = display.lastElementChild;

  if (!lastMsg || lastMsg.className !== `server ${user}`) {
    server.innerHTML = `<h3>${user}</h3>`;
  }

  server.innerHTML += `<p>${msg}</p>`;

  display.appendChild(server);
}

function checkSpam() {
  spam = true;
  send.setAttribute('disabled', 'true');
  setTimeout(() => {
    send.removeAttribute('disabled');
    spam = false;
  }, 3000);
}

btn.addEventListener('click', () => {
  join();
});

function join() {
  let user = usernameField.value;
  let room = roomField.value;

  if (!user) return;
  if (user.length <= 3) return;
  if (!room) return;
  if (room < 1) {
    room = 1;
    return;
  }
  if (room > 1000000) {
    room = 1000000;
    return;
  }

  username = user;
  roomId = room;
  home.style = 'display: none';
  socket.emit('join', { user, room });
}

function updateList(u) {
  usersList.innerHTML = '';
  if (u === null) {
    return;
  }

  u.forEach((e) => {
    usersList.innerHTML += `<li>${e}</li>`;
  });
}

function joined(user) {
  let joined = document.createElement('div');
  joined.className = 'joined';
  joined.innerHTML = `
  <div class="joined">
  <h3><i>+</i><span>${user}</span> has joined your room!</h3>
  </div>`;
  display.appendChild(joined);
}

function left(user) {
  let left = document.createElement('div');
  left.className = 'joined';
  left.innerHTML = `
  <div class="left">
  <h3><i>-</i><span>${user}</span> has left your room!</h3>
  </div>`;
  display.appendChild(left);
}
