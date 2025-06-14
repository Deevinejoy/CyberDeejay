'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface AudioPlayerProps {
  song: {
    id: number
    title: string
    artist: string
    cover: string
    duration: string
    audioUrl: string
  }
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  volume: number
  onVolumeChange: (volume: number) => void
}

export default function AudioPlayer({
  song,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
}: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/30 backdrop-blur-lg border-t border-purple-500/20 p-4">
      <audio
        ref={audioRef}
        src={song.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onNext}
      />
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <Image
            src={song.cover}
            alt={song.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium">{song.title}</h3>
          <p className="text-gray-400 text-sm">{song.artist}</p>
        </div>
        <div className="flex flex-col items-center gap-2 w-96">
          <div className="flex items-center gap-4">
            <button
              className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
              onClick={onPrevious}
            >
              ⏮
            </button>
            <button
              className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
              onClick={onPlayPause}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
              onClick={onNext}
            >
              ⏭
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-gray-400 text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1"
            />
            <span className="text-gray-400 text-sm">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
} 