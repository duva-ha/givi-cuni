// AdminModule.js
const AdminModule = ({ students, logout, db }) => {
    const [selWeek, setSelWeek] = React.useState(1);
    const [fee, setFee] = React.useState(5000);
    const [search, setSearch] = React.useState("");

    const saveFee = async () => {
        try {
            await db.collection("settings").doc("fees").set({
                [`week_${selWeek < 10 ? '0'+selWeek : selWeek}`]: parseInt(fee)
            }, { merge: true });
            alert(`✅ Đã lưu: Tuần ${selWeek} thu ${fee}đ`);
        } catch (err) {
            alert("Lỗi khi lưu: " + err.message);
        }
    };

    const updateXP = (id, currentXp, pts) => {
        db.collection("students").doc(id).update({
            totalXp: (currentXp || 0) + pts,
            level: Math.floor(((currentXp || 0) + pts) / 500) + 1
        });
    };

    return (
        <div className="max-w-lg mx-auto p-6 pb-20 animate-fadeIn">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Access: GV</p>
                    <h1 className="text-3xl font-black italic uppercase">Admin 10A7</h1>
                </div>
                <button onClick={logout} className="w-12 h-12 glass rounded-full text-red-500 flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <i className="fa-solid fa-power-off"></i>
                </button>
            </header>

            {/* THIẾT LẬP MỨC THU RIÊNG CHO TỪNG TUẦN */}
            <div className="glass p-6 rounded-[2.5rem] mb-6 border border-indigo-500/20 bg-indigo-500/5">
                <p className="text-[10px] font-black opacity-50 uppercase mb-4 text-center">Cài đặt phí theo tuần</p>
                <div className="flex gap-4 items-end">
                    <div className="w-1/3">
                        <label className="text-[8px] font-bold opacity-40 ml-2">CHỌN TUẦN</label>
                        <select value={selWeek} onChange={(e) => setSelWeek(parseInt(e.target.value))} 
                                className="w-full bg-white/5 p-4 rounded-xl font-bold outline-none text-white">
                            {[...Array(35)].map((_, i) => <option key={i+1} value={i+1} className="bg-[#020617]">Tuần {i+1}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="text-[8px] font-bold opacity-40 ml-2">MỨC THU (VNĐ)</label>
                        <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} 
                               className="w-full bg-white/5 p-4 rounded-xl font-black text-indigo-400 outline-none" />
                    </div>
                    <button onClick={saveFee} className="bg-indigo-600 px-6 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">LƯU</button>
                </div>
            </div>

            {/* DANH SÁCH HỌC SINH & TÌM KIẾM */}
            <div className="relative glass rounded-2xl flex items-center px-4 border border-white/5 mb-6">
                <i className="fa-solid fa-magnifying-glass text-gray-600 mr-3"></i>
                <input placeholder="TÌM TÊN ANH HÙNG..." className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase" 
                       value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="space-y-3">
                {students.filter(s => s.name.includes(search.toUpperCase())).map(s => (
                    <div key={s.id} className="glass p-5 rounded-[2.5rem] flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center font-black text-[10px]">{s.group}</div>
                            <div>
                                <p className="font-black text-sm uppercase tracking-tight">{s.name}</p>
                                <p className="text-[9px] opacity-40 font-bold uppercase">LV.{s.level} • {s.totalXp} XP</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => updateXP(s.id, s.totalXp, 10)} className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl font-black text-[10px]">HT</button>
                            <button onClick={() => updateXP(s.id, s.totalXp, 30)} className="w-10 h-10 bg-green-500/10 text-green-400 rounded-xl font-black text-[10px]">LĐ</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
