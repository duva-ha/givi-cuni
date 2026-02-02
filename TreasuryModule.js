// TreasuryModule.js - Nâng cấp Báo cáo: Tách biệt Quỹ đột xuất
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);
    const [selectedSpecialId, setSelectedSpecialId] = React.useState(null);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;

    // --- LOGIC TÍNH TOÁN MỚI ---
    const getReportData = () => {
        // 1. Chỉ tính thu từ Quỹ Tuần
        const totalWeeklyIncome = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            let sum = 0;
            Object.keys(s.funds).forEach(wk => {
                if (s.funds[wk] === true) sum += (weeklyFees[wk] || 5000);
            });
            return acc + sum;
        }, 0);

        // 2. Tổng chi tiêu từ quỹ chung
        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        return {
            totalWeeklyIncome,
            totalExpense,
            classBalance: totalWeeklyIncome - totalExpense // Tồn quỹ lớp thực tế
        };
    };

    const stats = getReportData();

    // 1. MENU CHÍNH (Giữ nguyên)
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-6 space-y-4 animate-fadeIn text-white">
            <h2 className="text-center text-2xl font-black italic mb-6 uppercase tracking-tighter">Treasury Center</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('weekly')} className="glass p-6 rounded-[2.5rem] flex flex-col items-center gap-4 border-b-4 border-blue-500 active:scale-95 text-white">
                    <i className="fa-solid fa-calendar-week text-2xl text-blue-500"></i><span className="font-bold text-[10px] uppercase">Quỹ Tuần</span>
                </button>
                <button onClick={() => setMode('special')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-orange-500 active:scale-95 text-white">
                    <i className="fa-solid fa-bolt text-2xl text-orange-500"></i><span className="font-bold text-[10px] uppercase">Đột Xuất</span>
                </button>
                <button onClick={() => setMode('expense')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-red-500 active:scale-95 text-white">
                    <i className="fa-solid fa-cart-shopping text-2xl text-red-500"></i><span className="font-bold text-[10px] uppercase">Chi Tiêu</span>
                </button>
                <button onClick={() => setMode('report')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-green-500 active:scale-95 text-white">
                    <i className="fa-solid fa-chart-pie text-2xl text-green-500"></i><span className="font-bold text-[10px] uppercase">Báo Cáo</span>
                </button>
            </div>
            <button onClick={logout} className="mt-8 opacity-30 text-[10px] font-bold uppercase underline text-center text-white">Thoát hệ thống</button>
        </div>
    );

    // 4. GIAO DIỆN BÁO CÁO MỚI (CHUYÊN NGHIỆP)
    if (mode === 'report') return (
        <div className="p-6 pb-24 animate-fadeIn text-white">
            <header className="flex justify-between items-center mb-8">
                <button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400 uppercase tracking-widest"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm tracking-tighter">Hệ thống báo cáo</h2>
                <div className="w-10"></div>
            </header>

            {/* KHỐI 1: TỒN QUỸ LỚP (CỐ ĐỊNH) */}
            <div className="glass p-8 rounded-[2.5rem] border-l-4 border-green-500 bg-green-500/5 mb-8 shadow-2xl relative overflow-hidden">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 text-white">Tồn quỹ lớp hiện tại</p>
                <h3 className="text-4xl font-black text-green-400 tracking-tighter">{stats.classBalance.toLocaleString()}đ</h3>
                <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight"><span className="opacity-40">Tổng thu quỹ tuần:</span><span className="text-blue-400">+{stats.totalWeeklyIncome.toLocaleString()}đ</span></div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight"><span className="opacity-40">Tổng đã chi chung:</span><span className="text-red-400">-{stats.totalExpense.toLocaleString()}đ</span></div>
                </div>
                <i className="fa-solid fa-piggy-bank absolute -right-4 -bottom-4 text-7xl opacity-[0.03]"></i>
            </div>

            {/* KHỐI 2: CHI TIẾT QUỸ ĐỘT XUẤT (TÁCH RIÊNG) */}
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] ml-2 mb-4 text-orange-500">Quản lý quỹ đột xuất</p>
            <div className="space-y-4">
                {specialFunds.length === 0 ? (
                    <div className="glass p-10 rounded-3xl text-center opacity-20 text-xs font-bold italic">Chưa có khoản thu đột xuất nào...</div>
                ) : specialFunds.map(f => {
                    const count = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
                    const totalCollected = count * (f.amount || 0);
                    const isFinished = f.status === 'done';

                    return (
                        <div key={f.id} className={`glass p-5 rounded-[2rem] border border-white/5 transition-all ${isFinished ? 'opacity-40 grayscale-[0.8]' : 'bg-orange-500/5 border-orange-500/20'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className={`font-black text-sm uppercase leading-tight ${isFinished ? 'line-through' : 'text-white'}`}>{f.name}</h4>
                                    <p className="text-[9px] font-bold text-orange-400 uppercase mt-1">Thu: {f.amount?.toLocaleString()}đ / HS</p>
                                </div>
                                {/* NÚT TICK ĐÁNH DẤU ĐÃ CHI XONG */}
                                <button 
                                    onClick={() => db.collection("special_funds").doc(f.id).update({ status: isFinished ? 'pending' : 'done' })}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFinished ? 'bg-green-600 text-white' : 'glass border-white/10 text-gray-500'}`}
                                >
                                    <i className={`fa-solid ${isFinished ? 'fa-check-double' : 'fa-check'}`}></i>
                                </button>
                            </div>
                            <div className="flex justify-between items-center border-t border-white/5 pt-3">
                                <span className="text-[10px] font-bold opacity-30 uppercase">Đã thu: {count}/{students.length} em</span>
                                <span className="font-black text-xs text-orange-400">+{totalCollected.toLocaleString()}đ</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <p className="mt-10 text-[8px] text-center opacity-10 font-black uppercase tracking-[0.4em]">10A7 Financial Transparency System</p>
        </div>
    );

    // QUỸ TUẦN, ĐỘT XUẤT, CHI TIÊU (Giữ nguyên logic của file cũ)
    // Thầy/Cô dán tiếp các phần if(mode === 'weekly')... của file cũ vào đây.
    return null; 
};
