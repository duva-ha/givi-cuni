// AdminModule.js
const AdminModule = ({ students = [], logout, db, weeklyFees = {} }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");
    const [filterGroup, setFilterGroup] = React.useState("ALL"); // "ALL" hoặc 1, 2, 3, 4, 5, 6

    // Logic lọc danh sách theo Tổ và Tìm kiếm
    const filteredStudents = students.filter(s => {
        const matchSearch = (s.name || "").includes(search.toUpperCase());
        const matchGroup = filterGroup === "ALL" || s.group === parseInt(filterGroup);
        return matchSearch && matchGroup;
    });

    // CHỨC NĂNG: XUẤT FILE BÁO CÁO (COPY TEXT)
    const exportData = () => {
        const header = `📊 BÁO CÁO THI ĐUA LỚP 10A7\n━━━━━━━━━━━━━━━\n`;
        const body = filteredStudents.map((s, i) => 
            `${i + 1}. [Tổ ${s.group}] ${s.name}: ${s.totalXp || 0} XP (Lv.${s.level || 1})`
        ).join("\n");
        
        navigator.clipboard.writeText(header + body);
        alert("✅ Đã sao chép danh sách thi đua vào bộ nhớ tạm!");
    };

    const updateXP = (id, currentXp, pts) => {
        if (!id || !db) return;
        db.collection("students").doc(id).update({
            totalXp: (currentXp || 0) + pts,
            level: Math.floor(((currentXp || 0) + pts) / 500) + 1
        });
    };

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black italic text-indigo-400">ADMIN 10A7</h1>
                <button onClick={logout} className="w-10 h-10 glass rounded-full text-red-500 flex items-center justify-center active:scale-90"><i className="fa-solid fa-power-off"></i></button>
            </header>

            {/* PHẦN 1: THIẾT LẬP PHÍ & XUẤT BÁO CÁO */}
            <div className="glass p-5 rounded-3xl mb-6 border border-white/5 bg-white/5">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Cấu hình & Báo cáo</p>
                    <button onClick={exportData} className="text-[10px] font-black text-green-400 border border-green-500/30 px-3 py-1 rounded-lg bg-green-500/5">
                        <i className="fa-solid fa-file-export mr-1"></i> XUẤT BÁO CÁO
                    </button>
                </div>
                <div className="flex gap-2 items-end">
                    <select value={selWeek} onChange={(e) => setSelWeek(parseInt(e.target.value))} className="w-1/3 bg-[#1e293b] p-3 rounded-xl font-bold text-xs text-white">
                        {[...Array(35)].map((_, i) => <option key={i+1} value={i+1}>Tuần {i+1}</option>)}
                    </select>
                    <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="flex-1 bg-[#1e293b] p-3 rounded-xl font-black text-indigo-400 text-sm outline-none" />
                    <button onClick={() => alert("Đã lưu phí!")} className="bg-indigo-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase">LƯU</button>
                </div>
            </div>

            {/* PHẦN 2: THÊM HỌC SINH */}
            <div className="glass p-5 rounded-3xl mb-8 border-dashed border-2 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-3 tracking-widest text-indigo-400">Thêm thành viên</p>
                <input id="nameInp" placeholder="NHẬP HỌ TÊN..." className="w-full p-4 glass rounded-xl mb-3 text-xs font-black uppercase outline-none text-white" />
                <div className="flex gap-3">
                    <select id="groupInp" className="flex-1 p-4 bg-[#1e293b] rounded-xl text-xs font-black outline-none text-white border border-white/10">
                        <option value="">CHỌN TỔ</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>TỔ {g}</option>)}
                    </select>
                    <button onClick={() => {/* Logic addStudent ở đây */}} className="hero-gradient px-6 rounded-xl font-black text-[10px] uppercase active:scale-95">XÁC NHẬN +</button>
                </div>
            </div>

            {/* PHẦN 3: BỘ LỌC TỔ & TÌM KIẾM */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setFilterGroup("ALL")} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterGroup === "ALL" ? 'hero-gradient text-white' : 'glass opacity-40'}`}>TẤT CẢ</button>
                {[1,2,3,4,5,6].map(g => (
                    <button key={g} onClick={() => setFilterGroup(g)} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black flex-shrink-0 transition-all ${filterGroup === g ? 'hero-gradient text-white' : 'glass opacity-40'}`}>
                        TỔ {g}
                    </button>
                ))}
            </div>

            <div className="relative glass rounded-2xl flex items-center px-4 mb-4 border border-white/5">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-2 text-xs"></i>
                <input placeholder="TÌM TÊN..." className="w-full py-3 bg-transparent outline-none text-xs font-bold uppercase text-white" 
                       value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="space-y-2">
                {filteredStudents.map(s => (
                    <div key={s.id} className="glass p-4 rounded-3xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center font-black text-[10px] text-white">{s.group}</div>
                            <h4 className="font-black text-xs uppercase text-white">{s.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black border border-blue-500/20">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-8 h-8 bg-green-500/10 text-green-400 rounded-lg text-[9px] font-black border border-green-500/20">LĐ</button>
                            <button onClick={() => {/* Logic deleteStudent ở đây */}} className="w-8 h-8 text-red-900/30 hover:text-red-500"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
