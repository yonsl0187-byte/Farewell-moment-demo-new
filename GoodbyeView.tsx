import React, { useState, useEffect } from 'react';
import { Friend, GoodbyeMessage } from '../types';
import { generateSpaceBackground } from '../services/geminiService';
import { Mic, Image as ImageIcon, Loader2, Lock, Save, AlertTriangle, Send, Edit2 } from 'lucide-react';

interface GoodbyeViewProps {
  messages: GoodbyeMessage[];
  friends: Friend[];
  addMessage: (msg: GoodbyeMessage) => void;
  updateMessage: (msg: GoodbyeMessage) => void;
}

export const GoodbyeView: React.FC<GoodbyeViewProps> = ({ messages, friends, addMessage, updateMessage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedWitnesses, setSelectedWitnesses] = useState<string[]>([]);
  const [existingBg, setExistingBg] = useState<string>('');

  // Filter friends who are confirmed witnesses (Max 3 allowed globally in Profile/Witness view, but here we just show available)
  const availableWitnesses = friends.filter(f => f.isWitness);

  const openCreateModal = () => {
      setEditingId(null);
      setContent('');
      setPrompt('');
      setSelectedFriends([]);
      setSelectedWitnesses([]);
      setExistingBg('');
      setIsModalOpen(true);
  };

  const openEditModal = (msg: GoodbyeMessage) => {
      setEditingId(msg.id);
      setContent(msg.content);
      setPrompt(''); // Prompt is reset as we don't store prompt, only generated image
      setSelectedFriends(msg.recipients);
      setSelectedWitnesses(msg.witnesses);
      setExistingBg(msg.backgroundImage);
      setIsModalOpen(true);
  };

  const toggleSelection = (id: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  // Logic: Max 3 witnesses for a specific message.
  const toggleWitnessSelection = (id: string) => {
      if (selectedWitnesses.includes(id)) {
          setSelectedWitnesses(selectedWitnesses.filter(item => item !== id));
      } else {
          if (selectedWitnesses.length < 3) {
              setSelectedWitnesses([...selectedWitnesses, id]);
          } else {
              alert("每条留言最多选择3位见证人");
          }
      }
  };

  const handleSubmit = async () => {
    if (!content || selectedFriends.length === 0 || selectedWitnesses.length === 0) return;
    setLoading(true);

    let bgImage = existingBg || "https://picsum.photos/400/300";
    try {
      if (prompt) {
        const generated = await generateSpaceBackground(prompt);
        if (generated) bgImage = generated;
      }
    } catch (e) {
      console.error(e);
    }

    const messageData: GoodbyeMessage = {
      id: editingId || Date.now().toString(),
      content,
      type: 'text',
      backgroundImage: bgImage,
      recipients: selectedFriends,
      witnesses: selectedWitnesses,
      createdAt: editingId ? (messages.find(m => m.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      status: 'locked'
    };

    if (editingId) {
        updateMessage(messageData);
    } else {
        addMessage(messageData);
    }

    setLoading(false);
    setIsModalOpen(false);
  };

  if (isModalOpen) {
    return (
      <div className="p-6 space-y-5 animate-fade-in pb-32 bg-slate-50 min-h-full pb-safe">
        <h2 className="text-2xl font-bold text-slate-800 pt-safe">{editingId ? '编辑临终遗言' : '录制临终遗言'}</h2>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-xs text-orange-700 flex gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" />
            <p className="leading-relaxed">本空间内容不具有法律效应。仅用于情感寄托，为爱留声。</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">给他们的话</label>
          <div className="relative">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-100 h-40 resize-none"
                placeholder="在这里留下你来不及诉说的话语..."
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500"><Mic className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">氛围场景 (AI {editingId ? '重新生成' : ''})</label>
          <input
             type="text"
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="例如：温暖的午后阳光，满天繁星"
             className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">送达给 (选择好友)</label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {friends.map(f => (
              <button
                key={f.id}
                onClick={() => toggleSelection(f.id, selectedFriends, setSelectedFriends)}
                className={`flex flex-col items-center min-w-[70px] p-2 rounded-xl transition-all ${selectedFriends.includes(f.id) ? 'bg-purple-100 scale-105' : 'bg-white border border-slate-100'}`}
              >
                <img src={f.avatar} className={`w-12 h-12 rounded-full mb-2 object-cover ${selectedFriends.includes(f.id) ? 'ring-2 ring-purple-500' : ''}`} />
                <span className={`text-xs truncate w-full text-center font-medium ${selectedFriends.includes(f.id) ? 'text-purple-700' : 'text-slate-500'}`}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">本条留言见证人 (1-3人)</label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {availableWitnesses.length === 0 && <p className="text-xs text-red-400 bg-red-50 p-2 rounded-lg">请先在见证中心管理见证人</p>}
            {availableWitnesses.map(f => (
              <button
                key={f.id}
                onClick={() => toggleWitnessSelection(f.id)}
                className={`flex flex-col items-center min-w-[70px] p-2 rounded-xl transition-all ${selectedWitnesses.includes(f.id) ? 'bg-blue-100 scale-105' : 'bg-white border border-slate-100'}`}
              >
                <img src={f.avatar} className={`w-12 h-12 rounded-full mb-2 object-cover ${selectedWitnesses.includes(f.id) ? 'ring-2 ring-blue-500' : ''}`} />
                <span className={`text-xs truncate w-full text-center font-medium ${selectedWitnesses.includes(f.id) ? 'text-blue-700' : 'text-slate-500'}`}>{f.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold">取消</button>
          <button
            onClick={handleSubmit}
            disabled={loading || !content || selectedFriends.length === 0 || selectedWitnesses.length === 0}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : (editingId ? '保存修改' : '加密封存')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">再见空间</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">留住最后的声音，直到那一刻</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-white px-5 py-2.5 rounded-full text-purple-600 text-sm font-bold shadow-md hover:shadow-lg border border-purple-100 transition flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          新建留言
        </button>
      </div>

      <div className="grid gap-5">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            onClick={() => openEditModal(msg)}
            className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Lock className="w-24 h-24 text-purple-500 rotate-12" />
            </div>
            
            <div className="flex justify-between items-start z-10 relative mb-4">
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-purple-700 font-bold text-xs">已封存 (点击编辑)</span>
                </div>
                <div className="text-xs text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleDateString()}</div>
            </div>
            
            <p className="text-slate-400 text-sm leading-relaxed blur-[3px] select-none mb-6">
               {msg.content}
            </p>
            
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex -space-x-2">
                    {msg.recipients.slice(0,3).map(id => (
                        <div key={id} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                    ))}
                </div>
                <span>发送给 {msg.recipients.length} 人</span>
                <span className="text-slate-300">|</span>
                <span>由 {msg.witnesses.length} 人见证</span>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
             <div className="text-center py-16 bg-white/60 rounded-3xl border border-white shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Save className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="text-slate-600 font-medium">暂无封存的遗言</p>
                <p className="text-xs text-slate-400 mt-1">未雨绸缪，为爱留声</p>
             </div>
        )}
      </div>
    </div>
  );
};