export type AudioZone = "FrontHall" | "WestCourt" | "Corridor" | "Rockery" | "WaterCourt" | "Interior" | "SideYard";

interface AudioZonePreset {
  rainGain: number;
  rainFrequency: number;
  rainQ: number;
  roomToneGain: number;
  roomToneFrequency: number;
}

const ZONE_PRESETS: Record<AudioZone, AudioZonePreset> = {
  FrontHall: { rainGain: 0.36, rainFrequency: 1050, rainQ: 0.62, roomToneGain: 0.055, roomToneFrequency: 118 },
  WestCourt: { rainGain: 0.7, rainFrequency: 1320, rainQ: 0.48, roomToneGain: 0.025, roomToneFrequency: 92 },
  Corridor: { rainGain: 0.48, rainFrequency: 940, rainQ: 0.72, roomToneGain: 0.045, roomToneFrequency: 105 },
  Rockery: { rainGain: 0.52, rainFrequency: 760, rainQ: 0.9, roomToneGain: 0.035, roomToneFrequency: 84 },
  WaterCourt: { rainGain: 0.78, rainFrequency: 1480, rainQ: 0.45, roomToneGain: 0.03, roomToneFrequency: 72 },
  Interior: { rainGain: 0.2, rainFrequency: 680, rainQ: 1.05, roomToneGain: 0.072, roomToneFrequency: 126 },
  SideYard: { rainGain: 0.58, rainFrequency: 1120, rainQ: 0.58, roomToneGain: 0.038, roomToneFrequency: 96 },
};

export const audioZoneForLayoutZones = (zones: readonly string[]): AudioZone => {
  if (zones.includes("water-court")) return "WaterCourt";
  if (zones.includes("rockery")) return "Rockery";
  if (zones.includes("corridor")) return "Corridor";
  if (zones.includes("inner-house") || zones.includes("north-house")) return "Interior";
  if (zones.includes("west-courtyard")) return "WestCourt";
  if (zones.includes("front-hall") || zones.includes("front-gate")) return "FrontHall";
  return "SideYard";
};

/**
 * Procedural atmosphere carrier used before final licensed sound assets are integrated.
 * The important production feature is the data-driven zone graph and smooth crossfade;
 * sample replacement later does not change chapter/runtime logic.
 */
export class AudioAtmosphere {
  private context?: AudioContext;
  private master?: GainNode;
  private rain?: AudioBufferSourceNode;
  private rainGain?: GainNode;
  private rainFilter?: BiquadFilterNode;
  private roomTone?: OscillatorNode;
  private roomToneGain?: GainNode;
  private currentZone: AudioZone = "SideYard";
  private requestedVolume = 0.8;

  start(volume: number) {
    this.requestedVolume = Math.max(0, Math.min(1, volume));
    if (this.context) {
      this.master?.gain.setTargetAtTime(this.requestedVolume * 0.3, this.context.currentTime, 0.08);
      void this.context.resume();
      return;
    }

    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.requestedVolume * 0.3;
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
    this.rainFilter = this.context.createBiquadFilter();
    this.rainFilter.type = "bandpass";
    this.rainGain = this.context.createGain();
    source.connect(this.rainFilter).connect(this.rainGain).connect(this.master);
    source.start();
    this.rain = source;

    this.roomTone = this.context.createOscillator();
    this.roomTone.type = "sine";
    this.roomToneGain = this.context.createGain();
    this.roomTone.connect(this.roomToneGain).connect(this.master);
    this.roomTone.start();

    this.applyZone(this.currentZone, 0.01);
  }

  setZone(zone: AudioZone, fadeSeconds = 0.8) {
    if (zone === this.currentZone) return;
    this.currentZone = zone;
    this.applyZone(zone, fadeSeconds);
  }

  zone(): AudioZone {
    return this.currentZone;
  }

  setMasterVolume(volume: number) {
    this.requestedVolume = Math.max(0, Math.min(1, volume));
    if (!this.context || !this.master) return;
    this.master.gain.setTargetAtTime(this.requestedVolume * 0.3, this.context.currentTime, 0.08);
  }

  private applyZone(zone: AudioZone, fadeSeconds: number) {
    if (!this.context) return;
    const preset = ZONE_PRESETS[zone];
    const now = this.context.currentTime;
    const timeConstant = Math.max(0.01, fadeSeconds / 3);
    this.rainGain?.gain.setTargetAtTime(preset.rainGain, now, timeConstant);
    this.rainFilter?.frequency.setTargetAtTime(preset.rainFrequency, now, timeConstant);
    this.rainFilter?.Q.setTargetAtTime(preset.rainQ, now, timeConstant);
    this.roomToneGain?.gain.setTargetAtTime(preset.roomToneGain, now, timeConstant);
    this.roomTone?.frequency.setTargetAtTime(preset.roomToneFrequency, now, timeConstant);
  }

  bell(memory: "wife" | "gardener" | "accountant" | "painter" = "wife") {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const frequency = memory === "wife" ? 660 : memory === "gardener" ? 470 : memory === "accountant" ? 560 : 390;
    oscillator.type = memory === "painter" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.66, now + 0.7);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 0.95);
  }

  paperScratch(intensity = 0.7) {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    const duration = 0.22;
    const frameCount = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < frameCount; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.58 + white * 0.42;
      const envelope = Math.sin((index / frameCount) * Math.PI);
      data[index] = previous * envelope;
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1450, now);
    filter.Q.value = 0.8;
    const gain = this.context.createGain();
    const peak = Math.max(0.015, Math.min(0.11, intensity * 0.075));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + duration + 0.02);
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
    try { this.rain?.stop(); } catch { /* already stopped */ }
    try { this.roomTone?.stop(); } catch { /* already stopped */ }
    void this.context?.close();
    this.context = undefined;
    this.master = undefined;
    this.rain = undefined;
    this.rainGain = undefined;
    this.rainFilter = undefined;
    this.roomTone = undefined;
    this.roomToneGain = undefined;
  }
}
