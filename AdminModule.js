// AdminModule.js
const AdminModule = ({ students = [], logout, db, weeklyFees = {} }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");
    const [filterGroup, setFilterGroup] = React.useState("ALL");

    // 1. CHỨC NĂNG XUẤT DỮ LIỆU (Copy Zalo)
    const exportData = () => {
        const title = `📊 BÁO CÁO THI ĐUA 10A7\n━━━━━━━━━━━━━━━\n`;
        const body = filteredStudents.map((s, i) => 
            `${i + 1}. [Tổ ${s.group || '?'}] ${s.name}: ${s.totalXp || 0} XP (Lv.${s.level || 1})`
        ).join("\n");
        navigator.clipboard.writeText(title + body);
        alert("✅ Đã copy báo cáo!");
    };

    // 2. LOGIC LỌC DANH SÁCH (Theo Tổ & Tìm kiếm)
    const filteredStudents = (students || []).filter(s => {
        const matchSearch = (s.name || "").toUpperCase().includes(search.toUpperCase());
        const matchGroup = filterGroup === "ALL" || s.group === parseInt(filterGroup);
        return matchSearch && matchGroup;
    });

    // 3. THÊM HỌC SINH
    const handleAdd = () => {
        const n = document.getElementById('nameInp')?.value;
        const g = document.getElementById('groupInp')?.value;
        if (!n || !g || !db) return alert("Thiếu tên, tổ hoặc chưa kết nối DB!");
        
        db.collection("students").add({
            name: n.toUpperCase().trim(),
            group: parseInt(g),
            totalXp: 0,
            level: 1,
            funds: {}
        }).then(() => {
            document.getElementById('nameInp').value = "";
            alert("✅ Đã thêm!");
        }).catch(e => alert("Lỗi: " + e.message));
    };

    // 4. XÓA HỌC SINH
    const handleDelete = (id, name) => {
        if (!db || !id) return;
        if (window.confirm(`Xóa vĩnh viễn ${name}?`)) {
            db.collection("students").doc(id).delete();
        }
    };

    const updateXP = (id, curXp, pts) => {
        if (!db || !id) return;
        db.collection("students").doc(id).update({
            totalXp: (curXp || 0) + pts,
            level: Math.floor(((curXp || 0) + pts) / 500) + 1
        });
    };

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            {/* Header với nút Xuất */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black italic text-indigo-400 leading-none">ADMIN 10A7</h1>
                    <p className="text-[9px] font-bold opacity-30 mt-1 uppercase">Quản lý & Xuất dữ liệu</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportData} className="bg-green-600/20 text-green-500 px-3 py-2 rounded-xl text-[10px] font-black border border-green-500/20 active:scale-95">
                        <i className="fa-solid fa-file-export mr-1"></i> XUẤT ZALO
                    </button>
                    <button onClick={logout} className="w-10 h-10 glass rounded-full text-red-500 flex items-center justify-center active:scale-90"><i className="fa-solid fa-power-off"></i></button>
                </div>
            </header>

            {/* BỘ LỌC TỔ */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                <button onClick={() => setFilterGroup("ALL")} className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${filterGroup === "ALL" ? 'hero-gradient text-white' : 'glass opacity-30'}`}>TẤT CẢ</button>
                {[1,2,3,4,5,6].map(g => (
                    <button key={g} onClick={() => setFilterGroup(g)} 
                        className={`px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${filterGroup == g ? 'hero-gradient text-white' : 'glass opacity-30'}`}>
                        TỔ {g}
                    </button>
                ))}
            </div>

            {/* BẢNG THÊM HỌC SINH */}
            <div className="glass p-5 rounded-[2rem] mb-8 border-dashed border-2 border-indigo-500/20 bg-indigo-500/5">
                <input id="nameInp" placeholder="NHẬP TÊN HỌC SINH..." className="w-full p-4 glass rounded-xl mb-3 text-xs font-black uppercase outline-none text-white" />
                <div className="flex gap-3">
                    <select id="groupInp" className="flex-1 p-4 bg-[#020617] rounded-xl text-xs font-black outline-none text-white border border-white/10">
                        <option value="">CHỌN TỔ</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>TỔ {g}</option>)}
                    </select>
                    <button onClick={handleAdd} className="hero-gradient px-8 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95">THÊM +</button>
                </div>
            </div>

            {/* THANH TÌM KIẾM */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-4 border border-white/5">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-2 text-xs"></i>
                <input placeholder="TÌM TÊN NHANH..." className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase text-white" 
                       value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* DANH SÁCH HIỂN THỊ */}
            <div className="space-y-3">
                {filteredStudents.map(s => (
                    <div key={s.id} className="glass p-4 rounded-[2rem] flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center font-black text-[12px] text-white">{s.group || "?"}</div>
                            <h4 className="font-black text-xs uppercase text-white">{s.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl text-[9px] font-black border border-blue-500/20">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-9 h-9 bg-green-500/10 text-green-400 rounded-xl text-[9px] font-black border border-green-500/20">LĐ</button>
                            <button onClick={() => handleDelete(s.id, s.name)} className="w-9 h-9 text-red-900/20 hover:text-red-500"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
