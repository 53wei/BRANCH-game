export class AudioAtmosphere {
  private context?: AudioContext;
  private master?: GainNode;
  private rain?: AudioBufferSourceNode;

  start(volume: number) {
    if (this.context) {
      void this.context.resume();
      return;
    }
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = Math.max(0, Math.min(1, volume)) * 0.3;
    this.master.connect(this.context.destination);

    const frameCount = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frameCount; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.92 + white * 0.08;
      channel[index] = previous * 0.75;
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const rainFilter = this.context.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1150;
    rainFilter.Q.value = 0.55;
    source.connect(rainFilter).connect(this.master);
    source.start();
    this.rain = source;
  }

  bell(memory: "wife" | "gardener") {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(memory === "wife" ? 660 : 470, now);
    oscillator.frequency.exponentialRampToValueAtTime(memory === "wife" ? 420 : 310, now + 0.7);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 0.95);
  }

  sting() {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(92, now);
    oscillator.frequency.exponentialRampToValueAtTime(39, now + 1.2);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 1.3);
  }

  dispose() {
    this.rain?.stop();
    void this.context?.close();
    this.context = undefined;
  }
}
