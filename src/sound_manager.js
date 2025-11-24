class SoundManager {
  constructor() {
    this.sounds = {
  spin: new Audio('./sounds/spin.wav'),
  stop: new Audio('./sounds/stop.wav'),
  win: new Audio('./sounds/win.wav'),
  bigwin: new Audio('./sounds/bigwin.wav'),
  gamble: new Audio('./sounds/gamble.wav'),
  scatter: new Audio('./sounds/scatter.wav')
};


    // volum default
    Object.values(this.sounds).forEach(a => {
      a.volume = 1;
    });
  }

  play(name) {
    const s = this.sounds[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {});
  }

  stop(name) {
    const s = this.sounds[name];
    if (!s) return;
    s.pause();
    s.currentTime = 0;
  }
}

const soundManager = new SoundManager();
export default soundManager;
