// SecurityModule.js
const SecurityModule = ({ students = [], db, logout }) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    // Hàm cấp mã tự động: 10A701, 10A702...
    const autoGenerate = async () => {
        if (!window.confirm("Cấp mã tự động cho cả lớp?")) return;
        const batch = db.batch();
        students.forEach((s, i) => {
            const stt = (i + 1).toString().padStart(2, '0');
            batch.update(db.collection("students").doc(s.id), { passcode: `10A7${stt}` });
        });
        await batch.commit();
        alert("✅ Đã cấp mã xong!");
    };

    return (
        <div className="max-w-lg mx-auto p-6 animate-fadeIn">
            <h2 className="text-2xl font-black text-amber-500 mb-6">SECURITY CENTER</h2>
            <button onClick={autoGenerate} className="w-full py-4 bg-amber-600 rounded-2xl font-black uppercase mb-8">
                Cấp mã tự động toàn lớp
            </button>
            <div className="space-y-2">
                {students.filter(s => s.name.includes(searchTerm.toUpperCase())).map(s => (
                    <div key={s.id} className="glass p-4 rounded-3xl flex justify-between items-center">
                        <div>
                            <p className="font-black text-xs uppercase">{s.name}</p>
                            <p className="text-[10px] text-amber-500">Mã: {s.passcode || "Chưa có"}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={logout} className="mt-8 opacity-30 text-xs w-full">ĐĂNG XUẤT</button>
        </div>
    );
};
