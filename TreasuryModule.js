// TreasuryModule.js
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;

    // --- LOGIC TÍNH TOÁN BÁO CÁO ---
    const getReportData = () => {
        const weekKey = getWeekKey(currentWeek);
        const feeThisWeek = weeklyFees[weekKey] || 5000;

        // 1. Tổng thu tuần (Tất cả các tuần cộng lại)
        const totalWeeklyIncome = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            let sum = 0;
            Object.keys(s.funds).forEach(wk => {
                if (s.funds[wk] === true) sum += (weeklyFees[wk] || 5000);
            });
            return acc + sum;
        }, 0);

        // 2. Thu tuần hiện tại (Đang chọn)
        const currentWeekIncome = students.filter(s => s.funds?.[weekKey] === true).length * feeThisWeek;

        // 3. Tổng thu đột xuất
        const totalSpecialIncome = specialFunds.reduce((acc, f) => {
            const count = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
            return acc + (count * (f.amount || 0));
        }, 0);

        // 4. Tổng chi tiêu
        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        return {
            totalWeeklyIncome,
            currentWeekIncome,
            totalSpecialIncome,
            totalExpense,
            balance: totalWeeklyIncome + totalSpecialIncome - totalExpense
        };
    };

    const stats = getReportData();

    // --- GIAO DIỆN CHÍNH ---
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-6 space-y-4 animate-fadeIn">
            <h2 className="text-center text-2xl font-black italic mb-6">TREASURY HUB</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('weekly')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-blue-500">
                    <i className="fa-solid fa-calendar-week text-2xl text-blue-500"></i><span className="font-bold text-[10px] uppercase">Quỹ Tuần</span>
                </button>
                <button onClick={() => setMode('special')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-orange-500">
                    <i className="fa-solid fa-bolt text-2xl text-orange-500"></i><span className="font-bold text-[10px] uppercase">Đột Xuất</span>
                </button>
                <button onClick={() => setMode('expense')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-red-500">
                    <i className="fa-solid fa-cart-shopping text-2xl text-red-500"></i><span className="font-bold text-[10px] uppercase">Chi Tiêu</span>
                </button>
                <button onClick={() => setMode('report')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-green-500">
                    <i className="fa-solid fa-chart-pie text-2xl text-green-500"></i><span className="font-bold text-[10px] uppercase">Báo Cáo</span>
                </button>
            </div>
            <button onClick={logout} className="mt-8 opacity-30 text-[10px] font-bold uppercase underline text-center">Đăng xuất</button>
        </div>
    );

    // --- GIAO DIỆN CHI TIÊU ---
    if (mode === 'expense') return (
        <div className="p-4 pb-20 animate-fadeIn">
            <header className="flex justify-between items-center mb-6">
                <button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">CHI TIÊU</h2>
                <div className="w-10"></div>
            </header>

            <div className="glass p-6 rounded-[2rem] mb-8 space-y-4 border-l-4 border-red-500">
                <input id="exName" placeholder="NỘI DUNG CHI..." className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase" />
                <input id="exAmount" type="number" placeholder="SỐ TIỀN (VNĐ)" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-red-400" />
                <button onClick={() => {
                    const name = document.getElementById('exName').value;
                    const amount = document.getElementById('exAmount').value;
                    if(name && amount) {
                        db.collection("expenses").add({
                            name: name.toUpperCase(),
                            amount: parseInt(amount),
                            date: new Date()
                        });
                        document.getElementById('exName').value = "";
                        document.getElementById('exAmount').value = "";
                    }
                }} className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all">
                    Xác nhận chi -
                </button>
            </div>

            <div className="space-y-3">
                {expenses.map(e => (
                    <div key={e.id} className="glass p-4 rounded-2xl flex justify-between items-center border border-white/5">
                        <div>
                            <p className="font-black text-xs uppercase">{e.name}</p>
                            <p className="text-[8px] opacity-30">{e.date?.toDate().toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-red-400 font-black text-sm">-{e.amount?.toLocaleString()}đ</span>
                            <button onClick={() => db.collection("expenses").doc(e.id).delete()} className="text-white/10 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- GIAO DIỆN BÁO CÁO (NÂNG CẤP) ---
    if (mode === 'report') return (
        <div className="p-6 pb-20 animate-fadeIn">
            <header className="flex justify-between items-center mb-8">
                <button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">TÀI CHÍNH 10A7</h2>
                <div className="w-10"></div>
            </header>

            <div className="space-y-4">
                {/* TỔNG TỒN QUỸ */}
                <div className="glass p-8 rounded-[2.5rem] border-l-4 border-green-500 bg-green-500/5 shadow-xl shadow-green-500/5">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Tồn quỹ thực tế</p>
                    <h3 className="text-4xl font-black text-green-400 leading-none">{stats.balance.toLocaleString()}đ</h3>
                </div>

                {/* CHI TIẾT THU CHI */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="glass p-5 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black opacity-30 uppercase mb-3 tracking-widest">Phân tích Quỹ Tuần</p>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                            <span className="text-[10px] font-bold opacity-60">Tổng thu (35 tuần):</span>
                            <span className="font-black text-blue-400 text-sm">+{stats.totalWeeklyIncome.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-60">Riêng tuần {currentWeek}:</span>
                            <span className="font-bold text-white text-xs">{stats.currentWeekIncome.toLocaleString()}đ</span>
                        </div>
                    </div>

                    <div className="glass p-5 rounded-3xl border border-white/5">
                        <p className="text-[9px] font-black opacity-30 uppercase mb-3 tracking-widest">Phân tích Đột Xuất</p>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-60">Tổng thu đột xuất:</span>
                            <span className="font-black text-orange-400 text-sm">+{stats.totalSpecialIncome.toLocaleString()}đ</span>
                        </div>
                    </div>

                    <div className="glass p-5 rounded-3xl border border-white/5 bg-red-500/5">
                        <p className="text-[9px] font-black opacity-30 uppercase mb-3 tracking-widest text-red-400">Phân tích Chi Tiêu</p>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-60">Tổng đã chi:</span>
                            <span className="font-black text-red-500 text-sm">-{stats.totalExpense.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return null;
};
