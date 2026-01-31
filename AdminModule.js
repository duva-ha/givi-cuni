// AdminModule.js
const AdminModule = ({ students, logout, db }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");

    // 1. Logic Lưu Phí Tuần
    const saveFee = async () => {
        try {
            await db.collection("settings").doc("fees").set({
                [`week_${selWeek < 10 ? '0'+selWeek : selWeek}`]: parseInt(fee)
            }, { merge: true });
            alert(`✅ Đã lưu: Tuần ${selWeek} thu ${fee}đ`);
        } catch (err) { alert("Lỗi: " + err.message); }
    };

    // 2. Logic Thêm Học Sinh (Chuẩn hóa Tổ)
    const addStudent = () => {
        const name = document.getElementById('nameInp').value;
        const group = document.getElementById('groupInp').value;
        if (!name || !group) {
            alert("Vui lòng nhập tên và chọn Tổ!");
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
        alert("✅ Đã thêm học sinh mới!");
    };

    // 3. Logic Xóa Học Sinh (Có xác nhận)
    const deleteStudent = (s) => {
        if (window.confirm(`Cảnh báo: Bạn có chắc chắn muốn XÓA học sinh ${s.name}? Dữ liệu sẽ không thể khôi phục!`)) {
            db.collection("students").doc(s.id).delete();
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
                <button onClick={logout} className="w-10 h-10 glass rounded-full text-red-500 flex items-center justify-center"><i className="fa-solid fa-power-off"></i></button>
            </header>

            {/* PHẦN 1: THIẾT LẬP PHÍ THEO TUẦN */}
            <div className="glass p-5 rounded-3xl mb-6 border border-white/5">
                <p className="text-[10px] font-black opacity-40 uppercase mb-3 tracking-widest text-center">Cài đặt phí tuần</p>
                <div className="flex gap-2 items-end">
                    <select value={selWeek} onChange={(e) => setSelWeek(parseInt(e.target.value))} className="w-1/3 bg-white/5 p-3 rounded-xl font-bold text-xs text-white outline-none">
                        {[...Array(35)].map((_, i) => <option key={i+1} value={i+1} className="bg-[#020617]">Tuần {i+1}</option>)}
                    </select>
                    <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="flex-1 bg-white/5 p-3 rounded-xl font-black text-indigo-400 outline-none text-sm" />
                    <button onClick={saveFee} className="bg-indigo-600 px-4 py-3 rounded-xl font-black text-[10px] uppercase">LƯU</button>
                </div>
            </div>

            {/* PHẦN 2: THÊM HỌC SINH MỚI (FIXED) */}
            <div className="glass p-5 rounded-3xl mb-8 border-dashed border-2 border-indigo-500/20">
                <p className="text-[10px] font-black opacity-40 uppercase mb-3 tracking-widest">Thêm Hero mới</p>
                <input id="nameInp" placeholder="TÊN HỌC SINH..." className="w-full p-4 glass rounded-xl mb-3 text-xs font-bold uppercase outline-none" />
                <div className="flex gap-3">
                    <select id="groupInp" className="flex-1 p-4 glass rounded-xl text-xs font-bold outline-none bg-[#020617]">
                        <option value="">CHỌN TỔ</option>
                        {[1,2,3,4,5,6].map(g => <option key={g} value={g}>TỔ {g}</option>)}
                    </select>
                    <button onClick={addStudent} className="hero-gradient px-6 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/20">XÁC NHẬN +</button>
                </div>
            </div>

            {/* PHẦN 3: TÌM KIẾM & DANH SÁCH + XÓA (FIXED) */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-4">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-2 text-xs"></i>
                <input placeholder="TÌM TÊN..." className="w-full py-3 bg-transparent outline-none text-xs font-bold uppercase" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="space-y-2">
                {students.filter(s => s.name.includes(search.toUpperCase())).map(s => (
                    <div key={s.id} className="glass p-4 rounded-3xl flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center font-black text-[10px]">{s.group}</div>
                            <h4 className="font-black text-[12px] uppercase">{s.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-black">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-8 h-8 bg-green-500/10 text-green-400 rounded-lg text-[9px] font-black">LĐ</button>
                            {/* NÚT XÓA HS */}
                            <button onClick={() => deleteStudent(s)} className="w-8 h-8 text-red-900/30 hover:text-red-500 transition-all"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
