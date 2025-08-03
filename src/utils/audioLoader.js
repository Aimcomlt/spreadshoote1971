function generateTone(freq, duration = 0.05) {
  const sampleRate = 8000;
  const length = Math.floor(sampleRate * duration);
  const buffer = new Uint8Array(44 + length * 2);
  const view = new DataView(buffer.buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);

  for (let i = 0; i < length; i++) {
    view.setInt16(
      44 + i * 2,
      Math.sin((2 * Math.PI * freq * i) / sampleRate) * 32767,
      true
    );
  }

  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }

  const base64 =
    typeof btoa === 'function'
      ? btoa(binary)
      : Buffer.from(binary, 'binary').toString('base64');
  return `data:audio/wav;base64,${base64}`;
}

const audioSources = {
  background: generateTone(220),
  shoot: generateTone(880),
  explosion: generateTone(110),
};

export default function loadSounds() {
  const promises = Object.entries(audioSources).map(([key, src]) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = src;
      audio.oncanplaythrough = () => resolve([key, audio]);
      audio.load();
    });
  });

  return Promise.all(promises).then((entries) =>
    entries.reduce((acc, [key, audio]) => {
      acc[key] = audio;
      return acc;
    }, {})
  );
}

