import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Headphones } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

type SoundMode = 'brown' | 'alpha' | 'rain';

export const NexoFlowPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundMode, setSoundMode] = useState<SoundMode>('brown');
  const [volume, setVolume] = useState(0.4);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  // Stop current audio graph
  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        (sourceNodeRef.current as any).stop?.();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.suspend();
    }
    setIsPlaying(false);
  };

  // Start sound generator based on mode using Web Audio API
  const startAudio = () => {
    stopAudio();

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioCtx();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (soundMode === 'brown') {
      // Brown Noise Generator (integrated pink/brown filter)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Boost amplitude
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      noiseSource.connect(gainNode);
      noiseSource.start();
      sourceNodeRef.current = noiseSource;
    } else if (soundMode === 'alpha') {
      // Binaural Beats Alpha Wave (200Hz Left, 210Hz Right = 10Hz Alpha Differential)
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);

      oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
      oscRight.frequency.setValueAtTime(210, ctx.currentTime);

      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscLeft.start();
      oscRight.start();

      sourceNodeRef.current = oscLeft;
    } else if (soundMode === 'rain') {
      // Synthetic Rain Generator (Filtered White noise with biquad lowpass)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);

      noiseSource.start();
      sourceNodeRef.current = noiseSource;
    }

    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAudio();
    }
  }, [soundMode]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <Card
      variant="default"
      padding="md"
      className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border-none shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-sm text-white">NEXO Flow State (Áudio de Foco)</h3>
        </div>
        <Badge variant={isPlaying ? 'success' : 'default'} size="sm">
          {isPlaying ? 'Em Reprodução' : 'Pausado'}
        </Badge>
      </div>

      <p className="text-xs text-slate-300">
        Gerador de som ambiente em tempo real para bloquear distrações e induzir foco profundo.
      </p>

      {/* Selectors */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {[
          { id: 'brown', label: '🤎 Ruído Castanho' },
          { id: 'alpha', label: '🧠 Ondas Alfa 10Hz' },
          { id: 'rain', label: '🌧️ Chuva Sintética' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSoundMode(item.id as SoundMode)}
            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
              soundMode === item.id
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-xs'
                : 'bg-white/10 border-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Volume slider & Play/Pause */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 size={14} className="text-indigo-300 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>

        <Button
          variant={isPlaying ? 'secondary' : 'primary'}
          size="sm"
          onClick={togglePlay}
          className="text-xs font-bold shrink-0"
          leftIcon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
        >
          {isPlaying ? 'Pausar Áudio' : 'Ouvir Flow'}
        </Button>
      </div>
    </Card>
  );
};
