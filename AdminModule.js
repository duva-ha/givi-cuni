// AdminModule.js
const AdminModule = ({ students = [], logout, db, weeklyFees = {} }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");

    // Hàm an toàn để cập nhật XP
    const updateXP = (id, currentXp, pts) => {
        if (!id || !db) return;
        db.collection("students").doc(id).update({
            totalXp: (currentXp || 0) + pts,
            level: Math.floor(((currentXp || 0) + pts) / 500) + 1
        }).catch(err => console.error("Lỗi cập nhật XP:", err));
    };

    // 1. CHỨC NĂNG LƯU PHÍ TUẦN
    const saveFee = async () => {
        if (!db) return;
        try {
            const weekKey = `week_${selWeek < 10 ? '0' + selWeek : selWeek}`;
            await db.collection("settings").doc("fees").set({
                [weekKey]: parseInt(fee) || 0
            }, { merge: true });
            alert(`✅ Đã lưu: Tuần ${selWeek} thu ${fee}đ`);
        } catch (err) {
            console.error("Lỗi lưu phí:", err);
            alert("Không thể lưu phí tuần!");
        }
    };

    // 2. CHỨC NĂNG THÊM HỌC SINH (KHÔI PHỤC)
    const handleAdd = () => {
        const nameInp = document.getElementById('nameInp');
        const groupInp = document.getElementById('groupInp');
        
        if (!nameInp || !groupInp) return;
        
        const name = nameInp.value.trim();
        const group = groupInp.value;

        if (!name || !group) {
            alert("Vui lòng nhập tên và chọn Tổ!");
            return;
        }

        db.collection("students").add({
            name: name.toUpperCase(),
            group: parseInt(group),
            totalXp: 0,
            level: 1,
            funds: {}
        }).then(() => {
            nameInp.value = "";
            alert("✅ Đã thêm học sinh mới!");
        }).catch(err => alert("Lỗi thêm HS: " + err.message));
    };

    // 3. CHỨC NĂNG XÓA HỌC SINH (KHÔI PHỤC)
    const handleDelete = (id, name) => {
        if (!id) return;
        if (window.confirm(`⚠️ CẢNH BÁO: Bạn có chắc muốn XÓA ${name}? Dữ liệu sẽ mất vĩnh viễn!`)) {
            db.collection("students").doc(id).delete()
                .then(() => alert("🗑️ Đã xóa học sinh."))
                .catch(err => alert("Lỗi xóa: " + err.message));
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black italic text-indigo-400">ADMIN 10A7</h1>
                <button onClick={logout} className="w-10 h-10 glass rounded-full text-red-500 flex items-center justify-center shadow-lg active:scale-90">
                    <i className="fa-solid fa-power-off"></i>
                </button>
            </header>

            {/* Bảng Cài đặt Phí */}
            <div className="glass p-5 rounded-3xl mb-6 border border-white/5 bg-white/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-3 text-center tracking-widest">Cấu hình phí tuần</p>
                <div className="flex gap-2 items-end">
                    <select value={selWeek} onChange={(e) => setSelWeek(parseInt(e.target.value))} className="w-1/3 bg-[#1e293b] p-3 rounded-xl font-bold text-xs text-white outline-none">
                        {[...Array(35)].map((_, i) => <option key={i+1} value={i+1}>Tuần {i+1}</option>)}
                    </select>
                    <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="flex-1 bg-[#1e293b] p-3 rounded-xl font-black text-indigo-400 outline-none text-sm" />
                    <button onClick={saveFee} className="bg-indigo-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95">LƯU</button>
                </div>
            </div>

            {/* Bảng Thêm Học Sinh - QUAN TRỌNG */}
            <div className="glass p-6 rounded-[2.5rem] mb-8 border-dashed border-2 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-4 tracking-widest text-indigo-400">QUẢN LÝ NHÂN SỰ</p>
                <input id="nameInp" placeholder="NHẬP HỌ TÊN..." className="w-full p-4 glass rounded-xl mb-4 text-xs font-black uppercase outline-none text-white" />
                <div className="flex gap-4">
                    <select id="groupInp" className="flex-1 p-4 bg-[#1e293b] rounded-xl text-xs font-black outline-none text-white border border-white/10">
                        <option value="">CHỌN TỔ</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>TỔ {g}</option>)}
                    </select>
                    <button onClick={handleAdd} className="hero-gradient px-8 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/30 active:scale-95">XÁC NHẬN +</button>
                </div>
            </div>

            {/* Danh sách & Tìm kiếm */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-6 border border-white/5">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-3 text-xs"></i>
                <input placeholder="TÌM TÊN ANH HÙNG..." className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase text-white" 
                       value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="space-y-3">
                {students.filter(s => (s.name || "").includes(search.toUpperCase())).map(s => (
                    <div key={s.id} className="glass p-5 rounded-[2.5rem] flex justify-between items-center border border-white/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center font-black text-[12px] text-white shadow-inner">{s.group || "?"}</div>
                            <h4 className="font-black text-sm uppercase tracking-tight text-white">{s.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-9 h-9 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black border border-blue-500/20">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-9 h-9 bg-green-500/10 text-green-400 rounded-xl text-[10px] font-black border border-green-500/20">LĐ</button>
                            <button onClick={() => handleDelete(s.id, s.name)} className="w-9 h-9 text-red-900/30 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
