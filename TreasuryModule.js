// TreasuryModule.js
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);
    const [selectedSpecial, setSelectedSpecial] = React.useState(null);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;

    // Giao diện Menu Chính
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-6 space-y-4 animate-fadeIn">
            <h2 className="text-center text-2xl font-black italic mb-6">TREASURY HUB</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('weekly')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-blue-500 active:scale-95">
                    <i className="fa-solid fa-calendar-week text-2xl text-blue-500"></i><span className="font-bold text-[10px] uppercase">Quỹ Tuần</span>
                </button>
                <button onClick={() => setMode('special')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-orange-500 active:scale-95">
                    <i className="fa-solid fa-bolt text-2xl text-orange-500"></i><span className="font-bold text-[10px] uppercase">Đột Xuất</span>
                </button>
                <button onClick={() => setMode('expense')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-red-500 active:scale-95">
                    <i className="fa-solid fa-cart-shopping text-2xl text-red-500"></i><span className="font-bold text-[10px] uppercase">Chi Tiêu</span>
                </button>
                <button onClick={() => setMode('report')} className="glass p-6 rounded-[2rem] flex flex-col items-center gap-4 border-b-4 border-green-500 active:scale-95">
                    <i className="fa-solid fa-chart-pie text-2xl text-green-500"></i><span className="font-bold text-[10px] uppercase">Báo Cáo</span>
                </button>
            </div>
            <button onClick={logout} className="mt-8 opacity-30 text-[10px] font-bold uppercase underline text-center">Đăng xuất</button>
        </div>
    );

    // Tab 1: Quỹ Tuần
    if (mode === 'weekly') return (
        <div className="pb-20 animate-fadeIn">
            <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                <button onClick={() => setMode(null)} className="text-gray-400 font-bold text-xs"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">QUỸ TUẦN {currentWeek}</h2>
                <div className="w-10"></div>
            </header>
            <div className="flex overflow-x-auto gap-3 py-6 px-4 no-scrollbar bg-white/5">
                {[...Array(35)].map((_, i) => (
                    <div key={i} onClick={() => setCurrentWeek(i+1)} className={`week-card flex-shrink-0 ${currentWeek === i+1 ? 'active-week' : 'glass opacity-30'}`}>
                        <span className="text-xl font-black">{i+1}</span>
                    </div>
                ))}
            </div>
            <div className="p-4 space-y-3">
                {students.map(s => {
                    const weekKey = getWeekKey(currentWeek);
                    const isPaid = s.funds && s.funds[weekKey] === true;
                    return (
                        <div key={s.id} className="glass p-5 rounded-[2rem] flex justify-between items-center border border-white/5">
                            <span className="font-black text-sm uppercase">{s.name}</span>
                            <button onClick={() => db.collection("students").doc(s.id).update({[`funds.${weekKey}`]: !isPaid})} 
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isPaid ? 'bg-green-600 shadow-lg' : 'bg-white/5 text-gray-500'}`}>
                                <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-hand-holding-dollar'}`}></i>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Tab 4: Báo Cáo (Sử dụng đơn giá động từ weeklyFees)
    if (mode === 'report') {
        const totalIncomeWeekly = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            let studentTotal = 0;
            Object.keys(s.funds).forEach(weekKey => {
                if (s.funds[weekKey] === true) {
                    studentTotal += (weeklyFees[weekKey] || 5000); // Lấy giá từ GV, mặc định 5k
                }
            });
            return acc + studentTotal;
        }, 0);

        const totalIncomeSpecial = specialFunds.reduce((acc, f) => {
            const paidCount = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
            return acc + (paidCount * (f.amount || 0));
        }, 0);

        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        const balance = totalIncomeWeekly + totalIncomeSpecial - totalExpense;

        return (
            <div className="p-6 animate-fadeIn">
                <header className="flex justify-between items-center mb-8"><button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button><h2 className="font-black italic uppercase text-sm">BÁO CÁO</h2><div className="w-6"></div></header>
                <div className="glass p-8 rounded-[2.5rem] border-l-4 border-green-500 bg-green-500/5 mb-6">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Tồn quỹ thực tế</p>
                    <h3 className="text-3xl font-black text-green-400">{balance.toLocaleString()}đ</h3>
                </div>
                {/* Các phần khác giữ nguyên... */}
            </div>
        );
    }

    return null;
};
