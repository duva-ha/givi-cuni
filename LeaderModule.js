// LeaderModule.js
const LeaderModule = ({ students = [], db, logout }) => {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterGroup, setFilterGroup] = React.useState("ALL");

    // Logic cập nhật XP (Hệ thống tự tính Level)
    const updateXP = (id, currentXp, pts) => {
        if (!db || !id) return;
        const newXp = (currentXp || 0) + pts;
        const newLevel = Math.floor(newXp / 500) + 1; // 500 XP lên 1 cấp
        
        db.collection("students").doc(id).update({
            totalXp: newXp,
            level: newLevel
        });
    };

    // Bộ lọc danh sách
    const filteredStudents = students.filter(s => {
        const matchName = (s.name || "").toUpperCase().includes(searchTerm.toUpperCase());
        const matchGroup = filterGroup === "ALL" || s.group === parseInt(filterGroup);
        return matchName && matchGroup;
    });

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            {/* Header Lớp Trưởng */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Access: Lớp Trưởng</p>
                    <h1 className="text-3xl font-black italic uppercase text-white">10A7 ARENA</h1>
                </div>
                <button onClick={logout} className="w-12 h-12 glass rounded-full text-red-500 flex items-center justify-center active:scale-90 shadow-lg shadow-red-500/10">
                    <i className="fa-solid fa-power-off"></i>
                </button>
            </header>

            {/* BỘ LỌC TỔ NHANH */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setFilterGroup("ALL")} className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${filterGroup === "ALL" ? 'hero-gradient text-white' : 'glass opacity-30'}`}>TẤT CẢ</button>
                {[1,2,3,4,5,6].map(g => (
                    <button key={g} onClick={() => setFilterGroup(g)} 
                        className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${filterGroup == g ? 'hero-gradient text-white' : 'glass opacity-30'}`}>
                        TỔ {g}
                    </button>
                ))}
            </div>

            {/* THANH TÌM KIẾM */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-6 border border-white/5">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-3 text-xs"></i>
                <input 
                    placeholder="TÌM TÊN BẠN..." 
                    className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase text-white" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
            </div>

            {/* DANH SÁCH CHẤM ĐIỂM */}
            <div className="space-y-3">
                {filteredStudents.map(s => (
                    <div key={s.id} className="glass p-5 rounded-[2.5rem] flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center font-black text-[12px] text-white">
                                {s.group || "?"}
                            </div>
                            <div>
                                <h4 className="font-black text-sm uppercase text-white leading-none">{s.name}</h4>
                                <p className="text-[9px] opacity-40 font-bold uppercase mt-1">LV.{s.level || 1} • {s.totalXp || 0} XP</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {/* Cộng điểm Học tập */}
                            <button 
                                onClick={() => updateXP(s.id, s.totalXp, 10)} 
                                className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black border border-blue-500/20 active:scale-90"
                            >
                                HT
                            </button>
                            {/* Cộng điểm Phát biểu/Lao động */}
                            <button 
                                onClick={() => updateXP(s.id, s.totalXp, 20)} 
                                className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl text-[10px] font-black border border-green-500/20 active:scale-90"
                            >
                                +20
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Hiển thị số lượng tìm thấy */}
            <p className="text-center text-[10px] opacity-20 mt-4 uppercase font-bold">
                Hiển thị {filteredStudents.length} học sinh
            </p>
        </div>
    );
};
