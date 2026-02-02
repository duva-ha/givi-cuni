const SecurityModule = ({ students = [], db, logout }) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    // 1. Cấp mã tự động toàn lớp (Giữ nguyên)
    const autoGenerate = async () => {
        if (!window.confirm("Cấp mã tự động (10A701...) cho toàn bộ danh sách?")) return;
        const batch = db.batch();
        students.forEach((s, i) => {
            const stt = (i + 1).toString().padStart(2, '0');
            batch.update(db.collection("students").doc(s.id), { passcode: `10A7${stt}` });
        });
        await batch.commit();
        alert("✅ Đã cập mã xong!");
    };

    // 2. TÍNH NĂNG MỚI: CẤP LẠI MÃ CHO CÁ NHÂN CỤ THỂ
    const changePasscode = (id, currentName) => {
        const newCode = window.prompt(`Nhập mã mới cho học sinh: ${currentName}`);
        if (newCode && newCode.trim() !== "") {
            db.collection("students").doc(id).update({
                passcode: newCode.trim().toUpperCase()
            }).then(() => {
                alert(`✅ Đã đổi mã cho ${currentName} thành: ${newCode.toUpperCase()}`);
            });
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4 pb-24 animate-fadeIn">
            <h2 className="text-2xl font-black text-amber-500 mb-6 uppercase italic text-center">Security Center</h2>
            
            <button onClick={autoGenerate} className="w-full py-4 bg-amber-600 rounded-2xl font-black uppercase mb-8 shadow-lg shadow-amber-500/20 active:scale-95 transition-all">
                Cấp mã tự động toàn lớp
            </button>

            {/* Ô tìm kiếm để tìm nhanh học sinh cần đổi mã */}
            <div className="relative glass rounded-2xl flex items-center px-4 mb-6 border border-white/10">
                <i className="fa-solid fa-magnifying-glass text-gray-500 mr-3"></i>
                <input 
                    placeholder="TÌM TÊN HỌC SINH CẦN ĐỔI MÃ..." 
                    className="w-full py-4 bg-transparent outline-none text-xs font-bold uppercase text-white"
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                />
            </div>

            <div className="space-y-3">
                {students
                    .filter(s => s.name.includes(searchTerm))
                    .map(s => (
                    <div key={s.id} className="glass p-5 rounded-[2rem] flex justify-between items-center border border-white/5">
                        <div>
                            <p className="font-black text-sm uppercase text-white">{s.name}</p>
                            <p className="text-[10px] font-bold text-amber-500 uppercase">Mã hiện tại: {s.passcode || "Chưa cấp"}</p>
                        </div>
                        {/* NÚT CẤP LẠI MÃ CÁ NHÂN */}
                        <button 
                            onClick={() => changePasscode(s.id, s.name)}
                            className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 hover:bg-amber-500/20 active:scale-90 transition-all border border-amber-500/20"
                            title="Cấp lại mã cho em này"
                        >
                            <i className="fa-solid fa-key-skeleton text-lg"></i>
                        </button>
                    </div>
                ))}
            </div>

            <button onClick={logout} className="mt-12 opacity-20 text-[10px] font-black uppercase tracking-[0.3em] w-full text-center">Đăng xuất hệ thống</button>
        </div>
    );
};
