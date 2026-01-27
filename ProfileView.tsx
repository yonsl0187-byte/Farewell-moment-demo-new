import React, { useState } from 'react';
import { Friend, User, ChatMessage } from '../types';
import { Search, MessageCircle, UserPlus, Settings, LogOut } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  friends: Friend[];
  addFriend: (name: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, friends, addFriend }) => {
  const [showChat, setShowChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock Chat UI
  const ChatInterface = ({ friendId, onClose }: { friendId: string; onClose: () => void }) => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) return null;
    
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col animate-slide-up">
            <div className="p-4 bg-white/80 backdrop-blur-md flex items-center gap-3 border-b border-slate-100 pt-12">
                <button onClick={onClose} className="text-slate-500 font-medium text-sm">返回</button>
                <img src={friend.avatar} className="w-8 h-8 rounded-full" />
                <span className="text-slate-800 font-bold">{friend.name}</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
                <div className="flex justify-start">
                    <div className="bg-white text-slate-700 p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl max-w-[80%] shadow-sm text-sm">
                        你好，最近怎么样？
                    </div>
                </div>
                 <div className="flex justify-end">
                    <div className="bg-purple-600 text-white p-3 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl max-w-[80%] shadow-md text-sm">
                        还在忙着开发那个App，关于告别的。
                    </div>
                </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 pb-8">
                <input type="text" className="flex-1 bg-slate-100 text-slate-800 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-100" placeholder="输入消息..." />
                <button className="bg-purple-600 text-white px-5 rounded-full font-bold text-sm shadow-md">发送</button>
            </div>
        </div>
    )
  }

  return (
    <div className="p-6 space-y-8 pb-32 relative">
      {showChat && <ChatInterface friendId={showChat} onClose={() => setShowChat(null)} />}
      
      {/* Header */}
      <div className="flex items-center gap-5 mb-8 bg-white p-6 rounded-3xl shadow-xl shadow-slate-100 border border-slate-50">
        <img src={user.avatar} className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-inner" />
        <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{user.name}</h1>
            <p className="text-slate-400 text-xs font-mono mt-1">ID: {user.id}</p>
        </div>
        <button className="ml-auto p-3 bg-slate-50 rounded-full hover:bg-slate-100 transition">
            <Settings className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Friend Search */}
      <div className="space-y-3">
         <h2 className="text-lg font-bold text-slate-800">查找用户</h2>
         <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-slate-800 shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-100" 
                    placeholder="输入用户名或ID"
                />
             </div>
             <button 
                onClick={() => {
                    if(searchQuery) {
                        addFriend(searchQuery);
                        setSearchQuery('');
                    }
                }}
                className="bg-slate-800 px-4 rounded-2xl text-white shadow-lg hover:bg-slate-900 transition"
            >
                <UserPlus className="w-5 h-5" />
             </button>
         </div>
      </div>

      {/* Friend List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            我的好友 
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{friends.length}</span>
        </h2>
        <div className="space-y-3">
            {friends.map(friend => (
                <div key={friend.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-50 active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-4">
                        <img src={friend.avatar} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <p className="text-slate-800 font-bold text-sm">{friend.name}</p>
                            <div className="flex gap-2 mt-0.5">
                                {friend.isWitness && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">见证人</span>}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowChat(friend.id)}
                        className="p-2.5 bg-slate-50 rounded-full hover:bg-purple-50 hover:text-purple-600 text-slate-400 transition"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};