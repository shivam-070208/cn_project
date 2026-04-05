const Socket = io();
var mystream
var call
let allow = true
var peer = new Peer({
  config: {
    'iceServers': [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  }
});
var peerid;
await peer.on('open', function (id) { peerid = id });

const getstream = async ({ video = true, audio = true }) => {
  const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
  return stream;
};
const addremoteStream = (stream, call) => {
  const maindiv = document.querySelector('.maindiv');

  // Check if stream already exists
  const existing = [...maindiv.querySelectorAll('video')].find(
    (vid) => vid.srcObject && vid.srcObject.id === stream.id
  );
  if (existing) return; // Prevent duplicates

  const video = document.createElement('video');
  video.srcObject = stream;
  video.classList.add('w-full');
  video.autoplay = true;
  video.playsInline = true;
  video.dataset.peerId = call.peer;
  maindiv.appendChild(video);
};

Socket.emit('join-me', { id: id });
Socket.on('enter', async () => {
  mystream = await getstream({ video: true, audio: true });

  const video = document.querySelector('.mystream');
  video.srcObject = mystream;
  video.play()
 
})

Socket.on('newmember', ({ socketid }) => {
  console.log('neewmemberallowed');
  Socket.emit('giveentry', { id: socketid, peer: peerid })
})
Socket.on('removepeer',(data)=>{
 const video = document.querySelector(`video[data-peer-id="${data.peer}"]`);
    if (video) {
      video.srcObject = null;
      video.remove();
    }
console.log(data)
})

Socket.on('allowed', async (data) => {
  console.log('theyneewmemberallowed');
  call = peer.call(data.peer, mystream);

  call.on('stream', (stream) => {

    addremoteStream(stream, call);
  });
  

})

document.querySelector('.controlbtn').addEventListener('click',()=>{
Socket.emit('close-call',{data:id,peer:peerid});
peer.destroy();
const url = new URL(window.origin);
url.pathname = '/'
window.location.href =url

})

window.addEventListener('beforeunload', (event) => {
  // Notify server and clean up
  Socket.emit('close-call', { data: id, peer: peerid,e:event });
  if (peer) peer.destroy();
  
  console.log(event)

  // Optional: Cancel the unload to give time for events (browsers may ignore it)
  event.preventDefault();
  event.returnValue = '';
});


peer.on('call', async function (call) {

  call.answer(mystream);
    call.on('stream', (stream) => {
  

    addremoteStream(stream, call);
  });
  call.on('close', () => {
    const video = document.querySelector(`video[data-peer-id="${call.peer}"]`);
    if (video) {
      video.srcObject = null;
      video.remove();
    }
  })
});



peer.on('disconnected', function() { 
 Socket.emit('close-call', { data: id, peer: peerid,e:event });

    peer.reconnect() 

});



// mice setup
const micOnIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"
viewBox="0 0 24 24">
  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/>
  <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
  <line x1="12" y1="19" x2="12" y2="23"/>
  <line x1="8" y1="23" x2="16" y2="23"/>
</svg>`;

const micOffIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"
viewBox="0 0 24 24">
  <line x1="1" y1="1" x2="23" y2="23"/>
  <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
  <path d="M12 19a7 7 0 0 0 7-7v-1"/>
  <path d="M5 10v1a7 7 0 0 0 11.17 5.19"/>
</svg>`;
const micBtn = document.querySelector('#micBtn');

micBtn.addEventListener('click', () => {
  const audioTrack = mystream.getAudioTracks()[0];
  if (!audioTrack) return;

  // Toggle audio track
  audioTrack.enabled = !audioTrack.enabled;

  // Update icon and aria attributes
  micBtn.setAttribute('aria-pressed', !audioTrack.enabled);
  micBtn.title = audioTrack.enabled ? 'Mute Microphone' : 'Unmute Microphone';
  micBtn.innerHTML = audioTrack.enabled
    ? micOnIconSVG
    : micOffIconSVG;
});



// cam setup
const camOnIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"
viewBox="0 0 24 24">
  <path d="M23 7l-7 5 7 5V7z"/>
  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
</svg>`;

const camOffIconSVG = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"
viewBox="0 0 24 24">
  <path d="M23 7l-7 5 7 5V7z"/>
  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>`;

const camBtn = document.querySelector('#cameraBtn');

camBtn.addEventListener('click', () => {
  const videoTrack = mystream.getVideoTracks()[0];
  if (!videoTrack) return;

  videoTrack.enabled = !videoTrack.enabled;

 
  camBtn.setAttribute('aria-pressed', !videoTrack.enabled);
  camBtn.title = videoTrack.enabled ? 'Turn Off Camera' : 'Turn On Camera';
  camBtn.innerHTML = videoTrack.enabled
    ? camOnIconSVG
    : camOffIconSVG;
});



document.getElementById('copyBtn').addEventListener('click', (e) => {
  const id = document.getElementById('user-id').innerText;
  navigator.clipboard.writeText(id).then(() => {
  e.target.innerText ="copied!"
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
});