import React, { useState } from 'react';
import { Friend, WitnessTask } from '../types';
import { UserCheck, AlertOctagon, CheckCircle2, Users, Archive, X, Check } from 'lucide-react';

interface WitnessViewProps {
  tasks: WitnessTask[];
  friends: Friend[];
  currentUserId: string;
  toggleWitnessStatus: (friendId: string) => void;
  confirmPassing: (taskId: string) => void;
  respondToInvitation: (taskId: string, accept: boolean) => void;
}

export const WitnessView: React.FC<WitnessViewProps> = ({ 
  tasks, 
  friends, 
  toggleWitnessStatus,
  confirmPassing,
  respondToInvitation
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'my-duties' | 'manage'>('requests');
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);

  const invitationTasks = tasks.filter(t => t.invitationStatus === 'pending_acceptance');
  const activeDutyTasks = tasks.filter(t => t.invitationStatus === 'accepted');

  // Count current witnesses
  const myWitnessCount = friends.filter(f => f.isWitness).length;

  const handleToggleWitness = (friendId: string) => {
      const friend = friends.find(f => f.id === friendId);
      if (!friend) return;

      if (!friend.isWitness) {
          if (myWitnessCount >= 3) {
              alert("您最多只能设置3位见证人");
              return;
          }
      }
      toggleWitnessStatus(friendId);
  }

  return (
    <div className="p-6 space-y-6 pb-32">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">见证中心</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">承诺与责任的交汇</p>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'requests' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          待确认请求
          {invitationTasks.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{invitationTasks.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('my-duties')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'my-duties' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          需我见证
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'manage' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          我的见证人
        </button>
      </div>

      {activeTab === 'requests' && (
         <div className="space-y-4 animate-fade-in">
             <div className="bg-blue-50/50 p-4 rounded-2xl text-xs text-blue-700 font-medium leading-relaxed mb-4 border border-blue-100">
                 当别人希望你成为他们的见证人时，你需要在此确认接受。这是对生命的庄重承诺。
             </div>
             {invitationTasks.length === 0 ? (
                 <div className="text-center py-16 opacity-50">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-slate-400" />
                     </div>
                     <p>暂无新的见证请求</p>
                 </div>
             ) : (
                 invitationTasks.map(task => (
                     <div key={task.id} className="bg-white p-5 rounded-2xl shadow-lg shadow-slate-100 border border-slate-50 flex flex-col gap-4">
                         <div className="flex items-center gap-4">
                             <img src={task.targetUserAvatar} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                             <div>
                                 <h3 className="font-bold text-slate-800 text-lg">{task.targetUserName}</h3>
                                 <p className="text-xs text-slate-500">邀请你成为TA的见证人</p>
                             </div>
                         </div>
                         <div className="flex gap-3 mt-2">
                             <button 
                                onClick={() => respondToInvitation(task.id, false)}
                                className="flex-1 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition"
                             >
                                婉拒
                             </button>
                             <button 
                                onClick={() => respondToInvitation(task.id, true)}
                                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs hover:bg-slate-900 transition shadow-lg shadow-slate-200"
                             >
                                接受承诺
                             </button>
                         </div>
                     </div>
                 ))
             )}
         </div>
      )}

      {activeTab === 'my-duties' && (
        <div className="space-y-4 animate-fade-in">
          {activeDutyTasks.length === 0 ? (
            <div className="text-center py-16 opacity-50">
               <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
               <p>你尚未见证任何人的告别</p>
            </div>
          ) : (
            activeDutyTasks.map(task => (
              <div key={task.id} className="bg-white border border-slate-50 rounded-2xl p-5 shadow-lg shadow-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                      <img src={task.targetUserAvatar} className="w-12 h-12 rounded-full border border-slate-100" />
                      {task.status === 'confirmed_deceased' && (
                          <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white p-1 rounded-full border-2 border-white">
                              <Archive className="w-3 h-3" />
                          </div>
                      )}
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold">{task.targetUserName}</h3>
                    <p className="text-xs text-slate-400">
                        {task.status === 'confirmed_deceased' ? '已确认离世' : '正在守护中'}
                    </p>
                  </div>
                </div>

                {task.status === 'alive' ? (
                    <button 
                        onClick={() => setShowConfirmModal(task.id)}
                        className="bg-slate-100 hover:bg-red-50 p-3 rounded-xl transition-all group border border-slate-200"
                        title="确认离世"
                    >
                        <Archive className="w-6 h-6 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                ) : (
                    <div className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-400">
                        任务完成
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4 animate-fade-in">
           <div className="bg-purple-50/50 p-4 rounded-2xl text-xs text-purple-700 font-medium leading-relaxed border border-purple-100 flex justify-between items-center">
             <span>见证人拥有确认你状态的最终权限。</span>
             <span className="font-bold">{myWitnessCount}/3</span>
           </div>
           
           <h3 className="text-slate-800 font-bold mt-4 text-sm uppercase tracking-wide opacity-70">好友列表</h3>
           <div className="space-y-3">
             {friends.map(friend => (
               <div key={friend.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                 <div className="flex items-center gap-3">
                   <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full object-cover" />
                   <div>
                     <p className="text-slate-800 text-sm font-bold">{friend.name}</p>
                     <p className="text-xs text-slate-400">ID: {friend.id}</p>
                   </div>
                 </div>
                 <button
                   onClick={() => handleToggleWitness(friend.id)}
                   className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                     friend.isWitness 
                       ? 'bg-green-100 text-green-700' 
                       : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                   }`}
                 >
                   {friend.isWitness ? '已设为' : '设为见证'}
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}

      {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertOctagon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-slate-800 mb-2">确认用户离世?</h3>
                  <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
                      您即将标记该用户为离世状态。此操作<strong className="text-red-500">不可撤销</strong>。
                      <br/><br/>
                      当该用户的所有指定见证人（或某条留言的所有见证人）都确认后，相关遗言将发送给亲友。
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setShowConfirmModal(null)}
                        className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-600 font-bold text-sm"
                      >
                          取消
                      </button>
                      <button 
                        onClick={() => {
                            confirmPassing(showConfirmModal);
                            setShowConfirmModal(null);
                        }}
                        className="flex-1 py-3 bg-red-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-600"
                      >
                          确认执行
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};