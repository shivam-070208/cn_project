const Socket = io();

let mystream;
let call;

var peer = new Peer({
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
});

let peerid;

peer.on('open', (id) => {
  peerid = id;
});

/* ================= STREAM ================= */

const getstream = async () => {
  return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
};

/* ================= ADD VIDEO ================= */

const addremoteStream = (stream, call) => {
  const maindiv = document.querySelector('.maindiv');

  const existing = [...maindiv.querySelectorAll('video')].find(
    v => v.srcObject && v.srcObject.id === stream.id
  );
  if (existing) return;

  const wrapper = document.createElement('div');
  wrapper.className = "video-box";

  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  video.dataset.peerId = call.peer;

  wrapper.appendChild(video);
  maindiv.appendChild(wrapper);
};

/* ================= SOCKET ================= */

Socket.emit('join-me', { id });

Socket.on('enter', async () => {
  mystream = await getstream();

  const video = document.querySelector('.mystream');
  video.srcObject = mystream;
  video.play();

  micBtn.innerHTML = micOnIcon;
  camBtn.innerHTML = camOnIcon;
});

Socket.on('newmember', ({ socketid }) => {
  Socket.emit('giveentry', { id: socketid, peer: peerid });
});

Socket.on('removepeer', (data) => {
  const video = document.querySelector(`video[data-peer-id="${data.peer}"]`);
  if (video) video.parentElement.remove();
});

/* ================= CALL ================= */

Socket.on('allowed', async (data) => {
  call = peer.call(data.peer, mystream);

  call.on('stream', (stream) => {
    addremoteStream(stream, call);
  });
});

peer.on('call', (call) => {
  call.answer(mystream);

  call.on('stream', (stream) => {
    addremoteStream(stream, call);
  });

  call.on('close', () => {
    const video = document.querySelector(`video[data-peer-id="${call.peer}"]`);
    if (video) video.parentElement.remove();
  });
});

/* ================= HANGUP ================= */
const hangBtn = document.getElementById('hangupBtn');

if (hangBtn) {

  // set icon
  hangBtn.innerHTML = `
  <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
    <path d="M22 16.92v3a2 2 0 0 1-2 2A19.79 19.79 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 1.72c.12.81.37 1.6.73 2.33a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.73.36 1.52.61 2.33.73A2 2 0 0 1 22 16.92z"/>
  </svg>`;

  // click handler
  hangBtn.onclick = () => {
    console.log("Hangup clicked");

    Socket.emit('close-call', { data: id, peer: peerid });

    if (peer) {
      try {
        peer.destroy();
      } catch (e) {
        console.log("Peer destroy error", e);
      }
    }

    window.location.href = "/";
  };

} else {
  console.error("hangupBtn not found");
}
/* ================= MIC ================= */

const micBtn = document.querySelector('#micBtn');

const micOnIcon = `
<svg viewBox="0 0 24 24" width="28" height="28" fill="white">
  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
  <path d="M5 10a7 7 0 0 0 14 0"/>
</svg>`;

const micOffIcon = `
<svg viewBox="0 0 24 24" width="28" height="28" fill="white">
  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
  <line x1="2" y1="2" x2="22" y2="22" stroke="red" stroke-width="2"/>
</svg>`;

micBtn.onclick = () => {
  const track = mystream.getAudioTracks()[0];
  if (!track) return;

  track.enabled = !track.enabled;
  micBtn.innerHTML = track.enabled ? micOnIcon : micOffIcon;
};

/* ================= CAMERA ================= */

const camBtn = document.querySelector('#cameraBtn');

const camOnIcon = `
<svg viewBox="0 0 24 24" width="28" height="28" fill="white">
  <rect x="3" y="6" width="15" height="12" rx="2"/>
</svg>`;

const camOffIcon = `
<svg viewBox="0 0 24 24" width="28" height="28" fill="white">
  <rect x="3" y="6" width="15" height="12" rx="2"/>
  <line x1="2" y1="2" x2="22" y2="22" stroke="red" stroke-width="2"/>
</svg>`;

camBtn.onclick = () => {
  const track = mystream.getVideoTracks()[0];
  if (!track) return;

  track.enabled = !track.enabled;
  camBtn.innerHTML = track.enabled ? camOnIcon : camOffIcon;
};

/* ================= COPY ================= */

document.getElementById('copyBtn').onclick = (e) => {
  const idText = document.getElementById('user-id').innerText;

  navigator.clipboard.writeText(idText).then(() => {
    e.target.innerText = "Copied!";
    setTimeout(() => e.target.innerText = "Copy", 1500);
  });
};