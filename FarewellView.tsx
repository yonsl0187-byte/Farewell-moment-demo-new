import React, { useState, useEffect, useRef } from 'react';
import { FarewellSpaceItem, FarewellItem } from '../types';
import { generateSpaceBackground, generateItemImage } from '../services/geminiService';
import { Loader2, Plus, Wind, ArrowLeft, Type, Sparkles, Clock, Music, Volume2, VolumeX, X } from 'lucide-react';

interface FarewellViewProps {
  spaces: FarewellSpaceItem[];
  addSpace: (space: FarewellSpaceItem) => void;
}

const getFadePercentage = (burialDate: string, durationDays: number) => {
  const start = new Date(burialDate).getTime();
  const now = Date.now();
  const end = start + durationDays * 24 * 60 * 60 * 1000;
  
  if (now < start) return 0;
  if (now > end) return 100;
  
  return Math.floor(((now - start) / (end - start)) * 100);
};

const TIME_OPTIONS = [
    { label: '2个月', days: 60 },
    { label: '6个月', days: 180 },
    { label: '1年', days: 365 },
    { label: '2年', days: 730 },
    { label: '5年', days: 1825 },
    { label: '永久', days: 36500 }
];

// Mock Music Options
const MUSIC_OPTIONS = [
    { id: 'm1', name: '寂静森林 (Forest)', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
    { id: 'm2', name: '温柔的雨 (Rain)', url: 'https://cdn.pixabay.com/audio/2021/08/09/audio_88447e769f.mp3' },
    { id: 'm3', name: '海浪声 (Ocean)', url: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0dcdd38253.mp3' },
    { id: 'm4', name: '钢琴曲 (Piano)', url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73467.mp3' },
    { id: 'm0', name: '无背景音乐', url: '' }
];

export const FarewellView: React.FC<FarewellViewProps> = ({ spaces, addSpace }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  
  // Creation State
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationIndex, setDurationIndex] = useState<number>(2);
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_OPTIONS[0]);

  // Detail View State
  const [itemText, setItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState<'text' | 'image' | null>(null);
  const [itemLoading, setItemLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const selectedSpace = spaces.find(s => s.id === selectedSpaceId);

  // Audio Auto-play Logic
  useEffect(() => {
    if (selectedSpace && selectedSpace.musicUrl) {
        const audio = new Audio(selectedSpace.musicUrl);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;
        
        // Attempt auto-play
        audio.play().catch(e => console.log("Auto-play prevented:", e));
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, [selectedSpace]);

  // Toggle Mute
  const toggleMute = () => {
      if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
          setIsMuted(!isMuted);
      }
  };

  const handleCreate = async () => {
    if (!prompt || !title) return;
    setLoading(true);
    
    let bgImage = "https://picsum.photos/400/600";
    try {
      const generatedBg = await generateSpaceBackground(prompt);
      if (generatedBg) {
        bgImage = generatedBg;
      }
    } catch (e) {
      console.error(e);
    }

    const newSpace: FarewellSpaceItem = {
      id: Date.now().toString(),
      title,
      description,
      backgroundImage: bgImage,
      burialDate: new Date().toISOString(),
      forgetDurationDays: TIME_OPTIONS[durationIndex].days,
      musicUrl: selectedMusic.url,
      musicName: selectedMusic.name,
      items: []
    };

    addSpace(newSpace);
    setLoading(false);
    setIsCreating(false);
    
    setPrompt('');
    setTitle('');
    setDescription('');
    setDurationIndex(2);
    setSelectedMusic(MUSIC_OPTIONS[0]);
  };

  const handleAddItem = async (type: 'text' | 'image') => {
    if (!selectedSpace || !itemText) return;
    setItemLoading(true);

    let content = itemText;
    if (type === 'image') {
        const generated = await generateItemImage(itemText, selectedSpace.description);
        if (generated) content = generated;
        else content = "https://picsum.photos/200/200";
    }

    const newItem: FarewellItem = {
        id: Date.now().toString(),
        type,
        content,
        createdAt: new Date().toISOString()
    };

    selectedSpace.items.unshift(newItem); 
    setItemLoading(false);
    setIsAddingItem(null);
    setItemText('');
  };

  // --- DETAIL VIEW (Immersive) ---
  if (selectedSpace) {
    const fadePercent = getFadePercentage(selectedSpace.burialDate, selectedSpace.forgetDurationDays);
    const opacity = Math.max(0.1, 1 - fadePercent / 100);

    return (
      <div className="relative h-full flex flex-col bg-slate-50">
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
            style={{ 
                backgroundImage: `url(${selectedSpace.backgroundImage})`,
                opacity: opacity,
                filter: `grayscale(${fadePercent}%) blur(${fadePercent / 10}px)`
            }}
        />
        <div className="absolute inset-0 z-0 bg-white/30 backdrop-blur-[2px]" />

        {/* Header */}
        <div className="relative z-10 flex items-center p-4 pt-safe">
          <button onClick={() => setSelectedSpaceId(null)} className="p-2 bg-white/50 hover:bg-white rounded-full backdrop-blur-md shadow-sm transition">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div className="ml-4 flex-1">
             <h2 className="text-xl font-bold text-slate-800 drop-shadow-sm">{selectedSpace.title}</h2>
             <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Wind className="w-3 h-3 text-purple-500" />
                <span>已消逝 {fadePercent}%</span>
             </div>
          </div>
          {selectedSpace.musicUrl && (
             <button onClick={toggleMute} className="p-2 bg-white/50 rounded-full backdrop-blur-md">
                 {isMuted ? <VolumeX className="w-5 h-5 text-slate-500"/> : <Volume2 className="w-5 h-5 text-purple-600 animate-pulse"/>}
             </button>
          )}
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
             <div className="glass-card rounded-2xl p-6 text-slate-700 shadow-xl border-white/60">
                <p className="text-lg font-serif italic leading-relaxed text-slate-800">"{selectedSpace.description}"</p>
                <div className="mt-4 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200/50 pt-3">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{selectedSpace.forgetDurationDays > 10000 ? '永久保存' : `预计 ${selectedSpace.forgetDurationDays} 天后消失`}</span>
                    </div>
                    {selectedSpace.musicName && (
                        <div className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            <span>{selectedSpace.musicName}</span>
                        </div>
                    )}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pb-32">
                {selectedSpace.items.map(item => (
                    <div key={item.id} className="bg-white/60 backdrop-blur-md rounded-xl overflow-hidden shadow-sm border border-white/50 hover:shadow-md transition">
                        {item.type === 'image' ? (
                            <img src={item.content} alt="memory" className="w-full h-32 object-cover" />
                        ) : (
                            <div className="p-4 h-32 flex items-center justify-center text-center text-sm text-slate-700 font-medium font-serif leading-relaxed">
                                {item.content}
                            </div>
                        )}
                        <div className="p-2 bg-white/50 text-[10px] text-slate-400 text-right">
                           {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
             </div>
        </div>

        {/* Action Bar */}
        <div className="absolute bottom-6 left-0 right-0 z-20 px-4 pb-safe flex gap-3 justify-center">
            {isAddingItem ? (
                <div className="w-full glass-card rounded-3xl p-4 animate-slide-up shadow-2xl">
                    <h3 className="text-slate-800 text-sm mb-2 font-bold">
                        {isAddingItem === 'text' ? '写下回忆' : '描述画面 (AI生成)'}
                    </h3>
                    <textarea 
                        value={itemText}
                        onChange={e => setItemText(e.target.value)}
                        className="w-full bg-white/80 rounded-xl p-3 text-slate-800 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-slate-200"
                        rows={3}
                        placeholder={isAddingItem === 'text' ? "那些难忘的瞬间..." : "例如：一张旧电影票，或者雨中的一把伞"}
                    />
                    <div className="flex gap-2">
                        <button onClick={() => setIsAddingItem(null)} className="flex-1 py-2 text-slate-500 text-sm font-medium">取消</button>
                        <button 
                            onClick={() => handleAddItem(isAddingItem)}
                            disabled={itemLoading || !itemText}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                        >
                            {itemLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            放入空间
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <button 
                        onClick={() => setIsAddingItem('text')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full text-slate-700 font-bold hover:bg-white transition shadow-lg border border-white/50"
                    >
                        <Type className="w-4 h-4 text-purple-500" /> 文字
                    </button>
                    <button 
                         onClick={() => setIsAddingItem('image')}
                         className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 backdrop-blur-md rounded-full text-white font-bold hover:opacity-90 transition shadow-lg shadow-purple-200"
                    >
                        <Sparkles className="w-4 h-4" /> 生成载体
                    </button>
                </>
            )}
        </div>
      </div>
    );
  }

  // --- CREATE VIEW ---
  if (isCreating) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col max-w-md mx-auto animate-fade-in">
        {/* Header - Fixed Top */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between pt-safe shrink-0">
            <h2 className="text-xl font-extrabold text-slate-800">创建告别空间</h2>
            <button onClick={() => setIsCreating(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                <X className="w-5 h-5 text-slate-500" />
            </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Card 1: Basic Info */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">告别对象</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition"
                    placeholder="例如：前任、旧时光"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <label className="text-sm font-bold text-slate-700">遗忘时间曲线</label>
                     <span className="text-purple-600 font-bold text-xs bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                         {TIME_OPTIONS[durationIndex].label}
                     </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max={TIME_OPTIONS.length - 1}
                    step="1"
                    value={durationIndex}
                    onChange={(e) => setDurationIndex(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <p className="text-xs text-slate-400 leading-relaxed">
                     设定一个时间，让这段记忆随风而逝。
                  </p>
                </div>
            </div>

            {/* Card 2: Atmosphere */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">背景音乐 (氛围)</label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                        {MUSIC_OPTIONS.map(music => (
                            <button
                                key={music.id}
                                onClick={() => setSelectedMusic(music)}
                                className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                                    selectedMusic.id === music.id 
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
                                    : 'bg-slate-50 text-slate-600 border-slate-100'
                                }`}
                            >
                                {music.id !== 'm0' && <Music className={`w-3 h-3 inline mr-2 ${selectedMusic.id === music.id ? 'text-white' : 'text-slate-400'}`} />}
                                {music.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">场景描述 <span className="text-purple-500 font-normal">(AI生成背景)</span></label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 h-28 resize-none transition"
                    placeholder="描述一个你想安放这段记忆的场景..."
                  />
                </div>
            </div>

            {/* Card 3: Content */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">内心独白 <span className="text-slate-400 font-normal">(首个载体)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 h-28 resize-none transition"
                    placeholder="写下你想埋葬的话..."
                  />
                </div>
            </div>
            {/* Padding for bottom buttons */}
            <div className="h-16"></div>
        </div>

        {/* Footer - Fixed Bottom */}
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-4 pb-safe flex gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] shrink-0">
          <button
            onClick={() => setIsCreating(false)}
            className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !title || !prompt}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200 active:scale-[0.98] transition"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : '生成仪式'}
          </button>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">告别空间</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">释放过去，拥抱新生</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-white p-3 rounded-full shadow-lg shadow-purple-100 border border-purple-100 hover:shadow-xl hover:scale-110 transition duration-300 group"
        >
          <Plus className="w-6 h-6 text-purple-600 group-hover:rotate-90 transition duration-300" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {spaces.map((space) => {
          const fadeLevel = getFadePercentage(space.burialDate, space.forgetDurationDays);
          
          return (
            <div
                key={space.id}
                onClick={() => setSelectedSpaceId(space.id)}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 h-72 group active:scale-[0.98] transition-all duration-500 cursor-pointer bg-white"
            >
                <div 
                    className="absolute inset-0 w-full h-full transition-all duration-1000 transform group-hover:scale-105"
                    style={{ opacity: Math.max(0.3, 1 - fadeLevel / 100) }}
                >
                    <img
                    src={space.backgroundImage}
                    alt={space.title}
                    className="w-full h-full object-cover"
                    />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent p-6 flex flex-col justify-end">
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">{space.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 font-medium opacity-80">{space.description}</p>
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                            <Wind className="w-3.5 h-3.5" />
                            <span>{fadeLevel}% 消逝</span>
                        </div>
                        {space.musicName && (
                            <div className="text-xs text-slate-500 bg-white/60 px-3 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-1">
                                <Music className="w-3 h-3"/> {space.musicName}
                            </div>
                        )}
                    </div>

                    <div className="h-1.5 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" 
                            style={{width: `${fadeLevel}%`}}
                        ></div>
                    </div>
                </div>
            </div>
          );
        })}
        {spaces.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Plus className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">开启第一次告别</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-[200px] mx-auto">创建一个神圣的空间，放下心中的重负。</p>
          </div>
        )}
      </div>
    </div>
  );
};