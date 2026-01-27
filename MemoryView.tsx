import React from 'react';
import { GoodbyeMessage, User } from '../types';
import { BookOpen, Star, Quote } from 'lucide-react';

interface MemoryViewProps {
  messages: GoodbyeMessage[]; // Messages RECEIVED by the user
  senders: User[]; // Map of sender IDs to User objects
}

export const MemoryView: React.FC<MemoryViewProps> = ({ messages, senders }) => {
  const getSender = (id: string) => senders.find(u => u.id === id);

  return (
    <div className="p-6 space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">回忆空间</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">爱从未消失，只是换了一种方式存在</p>
      </div>

      <div className="space-y-8">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <BookOpen className="w-10 h-10 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">等待开启的信笺</h3>
            <p className="text-sm text-slate-400 mt-2">当有人离开并给你留下讯息，会显示在这里</p>
          </div>
        ) : (
          messages.map(msg => {
            const sender = getSender(msg.witnesses[0] || '1'); 

            return (
              <div key={msg.id} className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/60 border border-slate-100 transform hover:-translate-y-1 transition duration-500">
                <div className="h-48 w-full relative">
                  <img src={msg.backgroundImage} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div className="flex items-center gap-4">
                      <img src={sender?.avatar || 'https://picsum.photos/50'} className="w-14 h-14 rounded-full border-4 border-white/20 backdrop-blur-sm" />
                      <div>
                        <p className="text-white font-bold text-lg text-shadow">{sender?.name || '未知'}</p>
                        <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">已前往彼岸</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-8 relative">
                   <Quote className="absolute top-6 left-6 w-8 h-8 text-slate-100 rotate-180" />
                   <p className="text-slate-600 leading-loose mb-6 whitespace-pre-wrap font-serif relative z-10 pl-4 border-l-2 border-purple-100">
                     {msg.content}
                   </p>
                   <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                      <span className="text-xs text-slate-400 font-medium">接收于 {new Date().toLocaleDateString()}</span>
                      <button className="text-xs bg-amber-50 text-amber-600 px-4 py-2 rounded-full font-bold flex items-center gap-1 hover:bg-amber-100 transition">
                        <Star className="w-3.5 h-3.5 fill-amber-600" /> 建立纪念碑
                      </button>
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};