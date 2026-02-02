// TreasuryModule.js - Phiên bản Mobile-X (Phóng to & Tối ưu điện thoại)
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);
    const [expenseWeek, setExpenseWeek] = React.useState(1);
    const [selectedSpecialId, setSelectedSpecialId] = React.useState(null);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;

    const stats = (() => {
        const totalWeekly = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            return acc + Object.keys(s.funds).reduce((sum, wk) => s.funds[wk] === true ? sum + (weeklyFees[wk] || 5000) : sum, 0);
        }, 0);
        const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
        return { totalWeekly, totalExp, balance: totalWeekly - totalExp };
    })();

    // 1. MENU CHÍNH PHÓNG TO
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-8 space-y-6 animate-fadeIn text-white">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Treasury</h2>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em]">Lớp 10A7 Center</p>
            </div>
            <div className="grid grid-cols-1 gap-5"> {/* Chuyển sang 1 cột trên mobile để nút to hơn */}
                <button onClick={() => setMode('weekly')} className="glass p-8 rounded-[3rem] flex items-center justify-between border-l-8 border-blue-500 active:scale-95 transition-all">
                    <div className="flex items-center gap-6">
                        <i className="fa-solid fa-calendar-week text-3xl text-blue-500"></i>
                        <span className="font-black text-lg uppercase">Quỹ Tuần</span>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-20"></i>
                </button>
                <button onClick={() => setMode('special')} className="glass p-8 rounded-[3rem] flex items-center justify-between border-l-8 border-orange-500 active:scale-95 transition-all">
                    <div className="flex items-center gap-6">
                        <i className="fa-solid fa-bolt text-3xl text-orange-500"></i>
                        <span className="font-black text-lg uppercase">Đột Xuất</span>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-20"></i>
                </button>
                <button onClick={() => setMode('expense')} className="glass p-8 rounded-[3rem] flex items-center justify-between border-l-8 border-red-500 active:scale-95 transition-all">
                    <div className="flex items-center gap-6">
                        <i className="fa-solid fa-cart-shopping text-3xl text-red-500"></i>
                        <span className="font-black text-lg uppercase">Chi Tiêu</span>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-20"></i>
                </button>
                <button onClick={() => setMode('report')} className="glass p-8 rounded-[3rem] flex items-center justify-between border-l-8 border-green-500 active:scale-95 transition-all">
                    <div className="flex items-center gap-6">
                        <i className="fa-solid fa-chart-pie text-3xl text-green-500"></i>
                        <span className="font-black text-lg uppercase">Báo Cáo</span>
                    </div>
                    <i className="fa-solid fa-chevron-right opacity-20"></i>
                </button>
            </div>
            <button onClick={logout} className="mt-12 opacity-20 text-xs font-black uppercase text-center tracking-widest underline">Thoát hệ thống</button>
        </div>
    );

    // 2. BÁO CÁO CẢI TIẾN (Tách biệt Quỹ đột xuất)
    if (mode === 'report') return (
        <div className="p-8 pb-32 animate-fadeIn text-white">
            <header className="flex justify-between items-center mb-12">
                <button onClick={() => setMode(null)} className="w-12 h-12 glass rounded-full flex items-center justify-center"><i className="fa-solid fa-chevron-left"></i></button>
                <h2 className="font-black uppercase text-lg italic tracking-tighter text-green-500">Báo cáo tài chính</h2>
                <div className="w-12"></div>
            </header>

            <div className="glass p-10 rounded-[3.5rem] border-t-8 border-green-500 bg-green-500/5 mb-10 shadow-2xl">
                <p className="text-xs font-black opacity-40 uppercase mb-2">Tồn quỹ lớp thực tế</p>
                <h3 className="text-5xl font-black text-white tracking-tighter">{stats.balance.toLocaleString()}đ</h3>
            </div>

            <p className="text-xs font-black opacity-30 uppercase tracking-[0.3em] mb-6 ml-4">Quỹ đột xuất (Thu/Chi hộ)</p>
            <div className="space-y-5">
                {specialFunds.map(f => {
                    const isDone = f.status === 'done';
                    const count = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
                    return (
                        <div key={f.id} className={`glass p-6 rounded-[2.5rem] border border-white/5 flex justify-between items-center ${isDone ? 'opacity-30 grayscale' : 'bg-orange-500/5'}`}>
                            <div>
                                <h4 className={`font-black text-sm uppercase ${isDone ? 'line-through' : ''}`}>{f.name}</h4>
                                <p className="text-[10px] font-bold text-orange-400">Đã thu: {(count * (f.amount || 0)).toLocaleString()}đ</p>
                            </div>
                            <button onClick={() => db.collection("special_funds").doc(f.id).update({status: isDone ? 'pending' : 'done'})}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isDone ? 'bg-green-600 text-white' : 'glass text-gray-600'}`}>
                                <i className={`fa-solid ${isDone ? 'fa-check-double' : 'fa-check'}`}></i>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // (Các phần Weekly, Special, Expense sẽ tương tự với padding và font size lớn hơn)
    return <div className="p-20 text-center font-black opacity-20 uppercase">Đang tải giao diện...</div>;
};
