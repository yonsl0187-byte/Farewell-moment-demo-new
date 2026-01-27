import React, { useState } from 'react';
import { ViewState, User, Friend, FarewellSpaceItem, GoodbyeMessage, WitnessTask } from './types';
import { FarewellView } from './components/FarewellView';
import { GoodbyeView } from './components/GoodbyeView';
import { MemoryView } from './components/MemoryView';
import { WitnessView } from './components/WitnessView';
import { ProfileView } from './components/ProfileView';
import { Home, Mic2, BookHeart, Eye, User as UserIcon } from 'lucide-react';

const CURRENT_USER: User = {
  id: 'u1',
  name: '开发者',
  avatar: 'https://picsum.photos/id/64/200/200',
};

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', name: '张伟', avatar: 'https://picsum.photos/id/1012/200/200', isWitness: false },
  { id: 'f2', name: '李娜', avatar: 'https://picsum.photos/id/1027/200/200', isWitness: true }, // I chose her
  { id: 'f3', name: '王强', avatar: 'https://picsum.photos/id/338/200/200', isWitness: false },
];

const INITIAL_TASKS: WitnessTask[] = [
  { 
      id: 't1', 
      targetUserId: 'f2', 
      targetUserName: '李娜', 
      targetUserAvatar: 'https://picsum.photos/id/1027/200/200',
      invitationStatus: 'accepted',
      status: 'alive' 
  },
  {
      id: 't2',
      targetUserId: 'f3',
      targetUserName: '王强',
      targetUserAvatar: 'https://picsum.photos/id/338/200/200',
      invitationStatus: 'pending_acceptance',
      status: 'alive'
  }
];

const INITIAL_FAREWELL_SPACES: FarewellSpaceItem[] = [
  {
    id: 's1',
    title: '那年的夏天',
    description: '告别那段青涩的恋情，让海风带走一切遗憾。',
    backgroundImage: 'https://picsum.photos/id/16/600/400',
    burialDate: '2023-10-01',
    forgetDurationDays: 365,
    musicUrl: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0dcdd38253.mp3', // Ocean sounds
    musicName: '海浪声 (Ocean)',
    items: [
        { id: 'i1', type: 'text', content: '我不再想你了，这是最后一次。', createdAt: '2023-10-01T10:00:00Z' },
        { id: 'i2', type: 'image', content: 'https://picsum.photos/id/101/300/300', createdAt: '2023-10-02T12:00:00Z' }
    ]
  }
];

// Mock Incoming Messages (Locked on server)
// In real app, this is in DB. Here we simulate them appearing when witnessed.
const HIDDEN_INCOMING_MESSAGES: GoodbyeMessage[] = [
    {
        id: 'msg_f2_1',
        content: "李娜给你的遗言：如果不开心，就去海边走走。",
        type: 'text',
        backgroundImage: 'https://picsum.photos/id/1027/600/400',
        recipients: ['u1'],
        witnesses: ['u1'], // I am the only witness for this message
        createdAt: '2023-12-01T10:00:00Z',
        status: 'locked'
    }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.FAREWELL);
  
  // App State
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [farewellSpaces, setFarewellSpaces] = useState<FarewellSpaceItem[]>(INITIAL_FAREWELL_SPACES);
  const [goodbyeMessages, setGoodbyeMessages] = useState<GoodbyeMessage[]>([]);
  const [memoryMessages, setMemoryMessages] = useState<GoodbyeMessage[]>([]); // Messages RECEIVED
  const [witnessTasks, setWitnessTasks] = useState<WitnessTask[]>(INITIAL_TASKS);

  // Mock Global Witness Status for other users (To simulate Rule B: All of user's witnesses confirmed)
  // Key: userId, Value: Count of confirmed witnesses
  // For simulation simplicity, we assume if I confirm, and I am the only one needed for demo.
  
  const addFarewellSpace = (space: FarewellSpaceItem) => {
    setFarewellSpaces([space, ...farewellSpaces]);
  };

  const addGoodbyeMessage = (msg: GoodbyeMessage) => {
    setGoodbyeMessages([msg, ...goodbyeMessages]);
  };

  const updateGoodbyeMessage = (msg: GoodbyeMessage) => {
    setGoodbyeMessages(goodbyeMessages.map(m => m.id === msg.id ? msg : m));
  };

  const addFriend = (name: string) => {
    const newFriend: Friend = {
      id: `f${Date.now()}`,
      name,
      avatar: `https://picsum.photos/seed/${name}/200/200`,
      isWitness: false
    };
    setFriends([...friends, newFriend]);
  };

  const toggleWitnessStatus = (friendId: string) => {
    setFriends(friends.map(f => 
      f.id === friendId ? { ...f, isWitness: !f.isWitness } : f
    ));
  };

  const respondToInvitation = (taskId: string, accept: boolean) => {
    if (accept) {
        setWitnessTasks(witnessTasks.map(t => 
            t.id === taskId ? { ...t, invitationStatus: 'accepted' } : t
        ));
    } else {
        setWitnessTasks(witnessTasks.filter(t => t.id !== taskId));
    }
  };

  const confirmPassing = (taskId: string) => {
    // 1. Mark my task as confirmed
    setWitnessTasks(witnessTasks.map(t => 
      t.id === taskId ? { ...t, status: 'confirmed_deceased' } : t
    ));

    const task = witnessTasks.find(t => t.id === taskId);
    if (!task) return;
    const targetUserId = task.targetUserId;

    // 2. Logic Check: Should we unlock messages?
    // We check HIDDEN_INCOMING_MESSAGES for any messages from targetUserId where I ('u1') am a witness.
    
    // In a real backend, we would check: 
    // Is (msg.witnesses that have confirmed) == msg.witnesses.length?
    // OR Is (total confirmed witnesses for user) == (total witnesses user has)?
    
    // SIMULATION: 
    // We find messages from this user sent to ME.
    // If I am in the witness list of that message, and I just confirmed... 
    // AND assuming for this demo I am the critical witness (or the only one for that message), we unlock it.

    const newUnlockedMessages = HIDDEN_INCOMING_MESSAGES.filter(msg => {
        // Is this message from the person I just confirmed dead?
        // (In mock data, we hardcoded msg_f2_1 is from f2, and task t1 target is f2)
        const isFromTarget = targetUserId === 'f2' && msg.id.includes('f2'); 
        
        // Am I a witness?
        const amIWitness = msg.witnesses.includes(CURRENT_USER.id);

        return isFromTarget && amIWitness;
    }).map(msg => ({...msg, status: 'delivered' as const}));

    if (newUnlockedMessages.length > 0) {
        setMemoryMessages([...newUnlockedMessages, ...memoryMessages]);
        alert(`已确认离世。系统检测到 ${newUnlockedMessages.length} 条遗言满足发布条件，已发送至您的回忆空间。`);
    } else {
        alert("已确认离世。等待其他见证人确认后，遗言将自动发布。");
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.FAREWELL:
        return <FarewellView spaces={farewellSpaces} addSpace={addFarewellSpace} />;
      case ViewState.GOODBYE:
        return <GoodbyeView messages={goodbyeMessages} friends={friends} addMessage={addGoodbyeMessage} updateMessage={updateGoodbyeMessage} />;
      case ViewState.MEMORY:
        return <MemoryView messages={memoryMessages} senders={friends} />;
      case ViewState.WITNESS:
        return <WitnessView 
          tasks={witnessTasks} 
          friends={friends} 
          currentUserId={CURRENT_USER.id}
          toggleWitnessStatus={toggleWitnessStatus}
          confirmPassing={confirmPassing}
          respondToInvitation={respondToInvitation}
        />;
      case ViewState.PROFILE:
        return <ProfileView user={CURRENT_USER} friends={friends} addFriend={addFriend} />;
      default:
        return <FarewellView spaces={farewellSpaces} addSpace={addFarewellSpace} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      
      {/* Main Content Area */}
      <main className="h-full overflow-y-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-safe">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-slate-100 pb-safe z-50">
        <div className="flex justify-around items-center p-2 pb-4 pt-3">
          <NavButton 
            active={currentView === ViewState.FAREWELL} 
            onClick={() => setCurrentView(ViewState.FAREWELL)}
            icon={<Home className="w-6 h-6" />}
            label="告别"
          />
          <NavButton 
            active={currentView === ViewState.GOODBYE} 
            onClick={() => setCurrentView(ViewState.GOODBYE)}
            icon={<Mic2 className="w-6 h-6" />}
            label="再见"
          />
           <NavButton 
            active={currentView === ViewState.MEMORY} 
            onClick={() => setCurrentView(ViewState.MEMORY)}
            icon={<BookHeart className="w-6 h-6" />}
            label="回忆"
          />
           <NavButton 
            active={currentView === ViewState.WITNESS} 
            onClick={() => setCurrentView(ViewState.WITNESS)}
            icon={<Eye className="w-6 h-6" />}
            label="见证"
          />
           <NavButton 
            active={currentView === ViewState.PROFILE} 
            onClick={() => setCurrentView(ViewState.PROFILE)}
            icon={<UserIcon className="w-6 h-6" />}
            label="我的"
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-purple-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;