import React, { useState, useRef, useEffect } from 'react';
import { Volume2, CloudRain, Coffee, Waves, Trees, Radio, Zap, Square } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

interface SoundTrack {
  id: string;
  title: string;
  icon: any;
  description: string;
  type: 'rain' | 'cafe' | 'waves' | 'forest' | 'white_noise';
}

export const FocusSoundscape: React.FC = () => {
  const { showToast } = useToast();
  const [activeSoundIds, setActiveSoundIds] = useState<Set<string>>(new Set(['st-1', 'st-2', 'st-3', 'st-4', 'st-5']));
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(75);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<Map<string, { stop: () => void }>>(new Map());

  const tracks: SoundTrack[] = [
    {
      id: 'st-1',
      title: 'Chuva Suave na Janela',
      icon: CloudRain,
      description: 'Sons de pingos de chuva relaxantes para foco profundo.',
      type: 'rain',
    },
    {
      id: 'st-2',
      title: 'Cafetaria Lo-Fi',
      icon: Coffee,
      description: 'Murmúrios e ambiente suave de café académico.',
      type: 'cafe',
    },
    {
      id: 'st-3',
      title: 'Ondas do Mar & Vento',
      icon: Waves,
      description: 'Frequência de ondas oceânicas para acalmar a mente.',
      type: 'waves',
    },
    {
      id: 'st-4',
      title: 'Floresta Tranquila',
      icon: Trees,
      description: 'Sons de brisa nas árvores e passarinhos distantes.',
      type: 'forest',
    },
    {
      id: 'st-5',
      title: 'Ruído Branco Binaural (Alfa 10Hz)',
      icon: Radio,
      description: 'Frequência de ondas alfa para memorização acelerada.',
      type: 'white_noise',
    },
  ];

  const getAudioContext = (): AudioContext | null => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const startTrackAudio = (track: SoundTrack, ctx: AudioContext, masterVolume: number) => {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime((masterVolume / 100) * 0.08, ctx.currentTime);

    let stopFn = () => {};

    if (track.type === 'rain') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start();

      stopFn = () => {
        try { whiteNoise.stop(); } catch {}
      };
    } else if (track.type === 'cafe') {
      const noiseBuffer = createNoiseBuffer(ctx);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(1.0, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();

      stopFn = () => {
        try { noise.stop(); } catch {}
      };
    } else if (track.type === 'waves') {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);

      lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
      lfoGain.gain.setValueAtTime(40, ctx.currentTime);

      lfo.connect(osc.frequency);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start();
      osc.start();

      stopFn = () => {
        try { osc.stop(); lfo.stop(); } catch {}
      };
    } else if (track.type === 'forest') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(660, ctx.currentTime);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.5, ctx.currentTime);

      osc1.connect(gainNode);
      osc2.connect(subGain);
      subGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      stopFn = () => {
        try { osc1.stop(); osc2.stop(); } catch {}
      };
    } else if (track.type === 'white_noise') {
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();

      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);

      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(210, ctx.currentTime);

      oscLeft.connect(gainNode);
      oscRight.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscLeft.start();
      oscRight.start();

      stopFn = () => {
        try { oscLeft.stop(); oscRight.stop(); } catch {}
      };
    }

    soundNodesRef.current.set(track.id, { stop: stopFn });
  };

  const stopAllAudio = () => {
    soundNodesRef.current.forEach((node) => node.stop());
    soundNodesRef.current.clear();
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
  };

  const startPlayingCurrentActive = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    soundNodesRef.current.forEach((node) => node.stop());
    soundNodesRef.current.clear();

    tracks.forEach((track) => {
      if (activeSoundIds.has(track.id)) {
        startTrackAudio(track, ctx, volume);
      }
    });

    setIsPlaying(true);
  };

  const handleActivateAllSounds = () => {
    const allIds = new Set(tracks.map((t) => t.id));
    setActiveSoundIds(allIds);
    const ctx = getAudioContext();
    if (ctx) {
      soundNodesRef.current.forEach((node) => node.stop());
      soundNodesRef.current.clear();

      tracks.forEach((track) => {
        startTrackAudio(track, ctx, volume);
      });
      setIsPlaying(true);
    }
    showToast('🎧 Todos os 5 ruídos de ambiente foram ATIVADOS simultaneamente!', 'success');
  };

  const handleStopAllSounds = () => {
    stopAllAudio();
    setIsPlaying(false);
    showToast('🔇 Todos os ruídos de ambiente foram pausados.', 'info');
  };

  const handleToggleSingleTrack = (trackId: string) => {
    const newActive = new Set(activeSoundIds);
    if (newActive.has(trackId)) {
      newActive.delete(trackId);
    } else {
      newActive.add(trackId);
    }
    setActiveSoundIds(newActive);

    if (isPlaying) {
      const ctx = getAudioContext();
      if (ctx) {
        soundNodesRef.current.forEach((node) => node.stop());
        soundNodesRef.current.clear();
        tracks.forEach((t) => {
          if (newActive.has(t.id)) {
            startTrackAudio(t, ctx, volume);
          }
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 size={20} className="text-indigo-500" />
            <span>Sintetizador de Ruídos de Ambiente &amp; Foco (Multi-Layer)</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Combine e ative ruídos de chuva, café, ondas, floresta e frequências binaurais em simultâneo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={isPlaying ? handleStopAllSounds : handleActivateAllSounds}
            className={`px-4 py-2 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 animate-pulse'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Square size={16} fill="currentColor" />
                <span>Pausar Todos os Ruídos</span>
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                <span>⚡ Ativar Todos os Ruídos</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <Volume2 size={16} className="text-indigo-500" />
            <span>{volume}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => {
                const newVol = Number(e.target.value);
                setVolume(newVol);
                if (isPlaying) {
                  startPlayingCurrentActive();
                }
              }}
              className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
          <span className="p-2 rounded-xl bg-indigo-600 text-white font-extrabold text-xs">
            {activeSoundIds.size}/{tracks.length}
          </span>
          <span>
            {activeSoundIds.size === tracks.length
              ? 'Todos os 5 ruídos de ambiente estão selecionados para execução simultânea.'
              : `${activeSoundIds.size} ruídos selecionados para a tua mistura de foco.`}
          </span>
        </div>

        <button
          onClick={handleActivateAllSounds}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors"
        >
          Ativar Todos os 5 Ruídos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((track) => {
          const IconComp = track.icon;
          const isTrackSelected = activeSoundIds.has(track.id);
          const isTrackActive = isTrackSelected && isPlaying;
          return (
            <div
              key={track.id}
              onClick={() => handleToggleSingleTrack(track.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                isTrackActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-500 shadow-lg scale-[1.02]'
                  : isTrackSelected
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-3 rounded-xl shrink-0 ${isTrackActive ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'}`}>
                <IconComp size={22} />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm leading-tight">{track.title}</h5>
                  {isTrackActive ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="A reproduzir em tempo real" />
                  ) : isTrackSelected ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-500" title="Ativado" />
                  ) : null}
                </div>
                <p className={`text-xs ${isTrackActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {track.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
