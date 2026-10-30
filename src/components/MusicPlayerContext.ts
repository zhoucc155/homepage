import React from 'react';

// 歌单连播模式：顺序播放 / 单曲循环 / 随机播放
export type PlayMode = 'order' | 'loop-one' | 'shuffle';

// 「查看歌单」跳转请求：n 自增保证重复点击可重复触发；无播放时 playlistKey/songKey 为 null（落地默认独处歌单）
export interface ViewPlaylistRequest {
  n: number;
  playlistKey: string | null;
  songKey: string | null;
}

export interface MusicPlayerState {
  currentSong: string | null; // 当前歌曲（歌单 key:歌名），控制红名/音量条/暂停键
  songPaused: boolean; // 当前歌曲是否处于暂停态
  focusedSong: string | null; // 背景被选取的歌曲行，与播放状态独立
  setFocusedSong: (key: string | null) => void;
  playStartedAt: number; // 播放起表时刻（performance.now()），歌词窗重挂载后仍能续算进度
  lyricHoldMs: number; // 歌词走表宽限（ms）：续播时先冻结断点句，等 iframe 重挂出声再推进
  playMode: PlayMode;
  setPlayMode: (mode: PlayMode) => void;
  toggleSong: (key: string) => void; // 同曲=播放/暂停切换，异曲=切换播放
  playPause: () => void; // 黑胶播放/暂停：未选歌时默认从「独处」歌单第一首开始
  skipSong: () => void; // 手动切歌：跳到下一首（单曲循环模式下手动切歌仍前进到列表下一首）
  viewPlaylist: () => void; // 「查看歌单」：切到影视音乐页正在播放（或最后播放）歌曲所在歌单列表
  viewRequest: ViewPlaylistRequest | null;
  setViewRequest: (r: ViewPlaylistRequest | null) => void; // 消费方处理完请求后清空，防止组件重挂载时旧请求复触发（切 tab 回来不定位）
  isPlaying: boolean; // 是否有歌曲正在出声（黑胶旋转/暂停态判断）
}

export const MusicPlayerContext = React.createContext<MusicPlayerState | null>(null);

export const usePlayer = (): MusicPlayerState => {
  const ctx = React.useContext(MusicPlayerContext);
  if (!ctx) throw new Error('usePlayer 必须在 MusicPlayerProvider 内使用');
  return ctx;
};
