// AdminModule.js
const AdminModule = ({ students, logout, db }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");

    // 1. Lưu mức thu theo tuần
    const saveFee = async () => {
        try {
            await db.collection("settings").doc("fees").set({
                [`week_${selWeek < 10 ? '0'+selWeek : selWeek}`]: parseInt(fee)
            }, { merge: true });
            alert(`✅ Đã lưu: Tuần ${selWeek} thu ${fee}đ`);
        } catch (err) { alert("Lỗi: " + err.message); }
    };

    // 2. Thêm học sinh mới
    const addStudent = () => {
        const name = document.getElementById('nameInp').value;
        const group = document.getElementById('groupInp').value;
        if (!name || !group) {
            alert("Vui lòng nhập đầy đủ tên và chọn Tổ!");
            return;
        }
        db.collection("students").add({
            name: name.toUpperCase().trim(),
            group: parseInt(group),
            totalXp: 0,
            level: 1,
            funds: {}
        });
        document.getElementById('nameInp').value = "";
        alert("✅ Đã thêm học sinh!");
    };

    // 3. Xóa học sinh
    const deleteStudent = (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA học sinh ${name}?`)) {
            db.collection("students").doc(id).delete();
        }
    };

    const updateXP = (id, currentXp, pts) => {
        db.collection("students").doc(id).update({
            totalXp: (currentXp || 0) + pts,
            level: Math.floor(((currentXp || 0) + pts) / 500) + 1
        });
    };

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black italic text-indigo-400">ADMIN 10A7</h1>
                <button onClick={logout} className="w-10 h-10 glass rounded-full text-red-500 flex items-center justify-center shadow-lg"><i className="fa-solid fa-power-off"></i></button>
            </header>

            {/* BẢNG 1: CÀI ĐẶT PHÍ */}
            <div className="glass p-5 rounded-3xl mb-6 border border-white/5 bg-white/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-3 text-center tracking-widest">Cài đặt phí theo tuần</p>
                <div className="flex gap-2 items-end">
                    <select value={selWeek} onChange={(e) => setSelWeek(parseInt(e.target.value))} className="w-1/3 bg-white/5 p-3 rounded-xl font-bold text-xs text-white outline-none">
                        {[...Array(35)].map((_, i) => <option key={i+1} value={i+1} className="bg-slate-900">Tuần {i+1}</option>)}
                    </select>
                    <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="flex-1 bg-white/5 p-3 rounded-xl font-black text-indigo-400 outline-none text-sm" />
                    <button onClick={saveFee} className="bg-indigo-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/20">LƯU</button>
                </div>
            </div>

            {/* BẢNG 2: THÊM HỌC SINH (MỚI BỔ SUNG) */}
            <div className="glass p-6 rounded-[2.5rem] mb-8 border-dashed border-2 border-indigo-500/20 bg-indigo-500/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-4 tracking-widest">Quản lý nhân sự</p>
                <input id="nameInp" placeholder="HỌ VÀ TÊN..." className="w-full p-4 glass rounded-xl mb-4 text-xs font-black uppercase outline-none" />
                <div className="flex gap-4">
                    <select id="groupInp" className="flex-1 p-4 glass rounded-xl text-xs font-black outline-none bg-[#020617] text-white border border-white/10">
                        <option value="">CHỌN TỔ</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>TỔ {g}</option>)}
                    </select>
                    <button onClick={addStudent} className="hero-gradient px-8 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/30">THÊM +</button>
                </div>
            </div>

            {/* DANH SÁCH & TÌM KIẾM */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-4 border border-white/5">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-3 text-xs"></i>
                <input placeholder="TÌM TÊN..." className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="space-y-3">
                {students.filter(s => s.name.includes(search.toUpperCase())).map(s => (
                    <div key={s.id} className="glass p-5 rounded-[2.5rem] flex justify-between items-center border border-white/5 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center font-black text-[12px]">{s.group}</div>
                            <h4 className="font-black text-sm uppercase tracking-tight">{s.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl text-[10px] font-black">LĐ</button>
                            {/* NÚT XÓA HỌC SINH */}
                            <button onClick={() => deleteStudent(s.id, s.name)} className="w-10 h-10 text-red-900/30 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
