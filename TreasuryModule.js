// TreasuryModule.js - Bản hoàn chỉnh: Sửa lỗi bảo mật nút bấm & Realtime
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);
    const [expenseWeek, setExpenseWeek] = React.useState(1);
    const [selectedSpecialId, setSelectedSpecialId] = React.useState(null);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;

    // --- 1. LOGIC TÍNH TOÁN BÁO CÁO ---
    const getReportData = () => {
        const totalWeeklyIncome = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            let sum = 0;
            Object.keys(s.funds).forEach(wk => {
                if (s.funds[wk] === true) sum += (weeklyFees[wk] || 5000);
            });
            return acc + sum;
        }, 0);

        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        return {
            totalWeeklyIncome,
            totalExpense,
            classBalance: totalWeeklyIncome - totalExpense
        };
    };

    const stats = getReportData();

    // --- 2. MENU CHÍNH ---
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-8 space-y-6 animate-fadeIn text-white">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Treasury</h2>
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.5em]">Lớp 10A7 OS</p>
            </div>
            <div className="grid grid-cols-1 gap-5 text-white">
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

    // --- 3. GIAO DIỆN QUỸ TUẦN ---
    if (mode === 'weekly') return (
        <div className="pb-24 animate-fadeIn text-white">
            <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                <button onClick={() => setMode(null)} className="text-gray-400 font-bold text-xs"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">Tuần {currentWeek}</h2>
                <div className="w-10"></div>
            </header>
            <div className="flex overflow-x-auto gap-3 py-6 px-4 no-scrollbar bg-white/5">
                {[...Array(35)].map((_, i) => (
                    <div key={i} onClick={() => setCurrentWeek(i+1)} className={`min-w-[70px] h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${currentWeek === i+1 ? 'bg-blue-600 border-blue-400 scale-105' : 'glass opacity-30'}`}>
                        <span className="text-[10px] font-bold">T.</span><span className="text-xl font-black">{i+1}</span>
                    </div>
                ))}
            </div>
            <div className="p-6 space-y-4">
                <div className="glass p-6 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5">
                    <p className="text-[10px] font-black opacity-40 mb-2 uppercase text-center">Tiền quỹ tuần {currentWeek} (đ)</p>
                    <input type="number" value={weeklyFees[getWeekKey(currentWeek)] || ""} placeholder="5,000"
                        onChange={(e) => db.collection("settings").doc("weekly_fees").set({ [getWeekKey(currentWeek)]: parseInt(e.target.value) || 0 }, { merge: true })}
                        className="w-full bg-white/5 p-4 rounded-2xl outline-none font-black text-blue-400 text-center text-2xl" />
                </div>
                {students.map(s => {
                    const wk = getWeekKey(currentWeek);
                    const isPaid = s.funds && s.funds[wk] === true;
                    return (
                        <div key={s.id} className="glass p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5">
                            <span className="font-black text-sm uppercase">{s.name}</span>
                            <button onClick={() => {
                                if (!s.id) return;
                                db.collection("students").doc(s.id).update({[`funds.${wk}`]: !isPaid})
                                .catch(err => alert("Lỗi kết nối, hãy kiểm tra lại mạng!"));
                            }} 
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isPaid ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-600'}`}>
                                <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-hand-holding-dollar'}`}></i>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // --- 4. GIAO DIỆN ĐỘT XUẤT ---
    if (mode === 'special') {
        const currentFund = specialFunds.find(f => f.id === selectedSpecialId);
        return (
            <div className="pb-24 animate-fadeIn text-white">
                <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                    <button onClick={() => { setMode(null); setSelectedSpecialId(null); }} className="text-gray-400 font-bold text-xs"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                    <h2 className="font-black italic uppercase text-sm">ĐỘT XUẤT</h2><div className="w-10"></div>
                </header>
                {!currentFund ? (
                    <div className="p-6 space-y-4">
                        <div className="glass p-6 rounded-[2.5rem] border-dashed border-2 border-orange-500/20 bg-orange-500/5">
                            <input id="spN" placeholder="TÊN KHOẢN THU..." className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase mb-3 text-white border border-white/5" />
                            <input id="spA" type="number" placeholder="SỐ TIỀN MỖI HS" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-orange-400 mb-4 border border-white/5" />
                            <button onClick={() => { 
                                const n = document.getElementById('spN').value; 
                                const a = document.getElementById('spA').value; 
                                if(n && a) db.collection("special_funds").add({ name: n.toUpperCase(), amount: parseInt(a), date: new Date(), payments: {} }); 
                            }} className="w-full py-4 bg-orange-600 rounded-2xl font-black uppercase text-xs active:scale-95 shadow-lg shadow-orange-500/20">Tạo mới +</button>
                        </div>
                        {specialFunds.map(f => (
                            <div key={f.id} onClick={() => setSelectedSpecialId(f.id)} className="glass p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5 active:scale-95 transition-all">
                                <div><h4 className="font-black text-sm uppercase">{f.name}</h4><p className="text-[10px] font-bold text-orange-400">{f.amount?.toLocaleString()}đ / HS</p></div>
                                <i className="fa-solid fa-chevron-right opacity-20"></i>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 animate-fadeIn">
                        <button onClick={() => setSelectedSpecialId(null)} className="text-orange-500 font-black text-[10px] uppercase mb-4 underline">Quay lại</button>
                        <div className="space-y-3 h-[60vh] overflow-y-auto no-scrollbar pb-10">
                            {students.map(s => {
                                const isPaid = currentFund.payments && currentFund.payments[s.id] === true;
                                return (
                                    <div key={s.id} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5">
                                        <span className="font-black text-sm uppercase">{s.name}</span>
                                        <button onClick={() => {
                                            if (!currentFund.id || !s.id) return;
                                            db.collection("special_funds").doc(currentFund.id).update({[`payments.${s.id}`]: !isPaid})
                                            .catch(err => alert("Lỗi ghi nhận, hãy thử lại!"));
                                        }} 
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isPaid ? 'bg-orange-600 text-white shadow-lg' : 'bg-white/5 text-gray-600'}`}>
                                            <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-coins'}`}></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- 5. GIAO DIỆN CHI TIÊU ---
    if (mode === 'expense') return (
        <div className="p-6 pb-24 animate-fadeIn text-white">
            <header className="flex justify-between items-center mb-8 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 py-4 border-b border-white/5">
                <button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400 uppercase"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">CHI TIÊU</h2><div className="w-10"></div>
            </header>
            <div className="mb-6">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-3 ml-2 text-red-500">Chọn tuần để chi:</p>
                <div className="flex overflow-x-auto gap-2 no-scrollbar">
                    {[...Array(35)].map((_, i) => (
                        <button key={i} onClick={() => setExpenseWeek(i+1)} className={`min-w-[60px] py-4 rounded-xl font-black text-xs border transition-all ${expenseWeek === i+1 ? 'bg-red-600 border-red-400 scale-105 shadow-lg' : 'glass opacity-20'}`}>T.{i+1}</button>
                    ))}
                </div>
            </div>
            <div className="glass p-8 rounded-[3rem] bg-red-500/5 border-l-8 border-red-500 mb-8 shadow-2xl">
                <p className="text-[8px] font-black text-red-400 uppercase mb-2">Đang chi cho TUẦN {expenseWeek}</p>
                <input id="exN" placeholder="NỘI DUNG CHI..." className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase mb-3 text-white border border-white/5" />
                <input id="exA" type="number" placeholder="SỐ TIỀN" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-red-400 mb-4 border border-white/5" />
                <button onClick={() => {
                    const n = document.getElementById('exN').value; 
                    const a = document.getElementById('exA').value;
                    if(n && a) { 
                        db.collection("expenses").add({ 
                            name: n.toUpperCase(), amount: parseInt(a), date: new Date(), week_key: getWeekKey(expenseWeek) 
                        }).catch(err => alert("Không thể lưu phiếu chi!"));
                        document.getElementById('exN').value=""; document.getElementById('exA').value=""; 
                    }
                }} className="w-full py-5 bg-red-600 rounded-3xl font-black uppercase text-xs shadow-lg active:scale-95">Xác nhận chi -</button>
            </div>
            <div className="space-y-4">
                {expenses.sort((a,b) => b.date - a.date).map(e => (
                    <div key={e.id} className="glass p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5">
                        <div className="flex items-center gap-4 text-white">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-[10px] font-black text-red-500 border border-red-500/20">{e.week_key ? e.week_key.split('_')[1] : '??'}</div>
                            <div><p className="font-black text-xs uppercase leading-tight">{e.name}</p></div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-red-400 font-black text-sm">-{e.amount?.toLocaleString()}đ</span>
                            <button onClick={() => { if(window.confirm("Xóa phiếu chi này?")) db.collection("expenses").doc(e.id).delete(); }} className="opacity-10"><i className="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- 6. GIAO DIỆN BÁO CÁO ---
    if (mode === 'report') return (
        <div className="p-8 pb-32 animate-fadeIn text-white">
            <header className="flex justify-between items-center mb-10">
                <button onClick={() => setMode(null)} className="w-12 h-12 glass rounded-full flex items-center justify-center"><i className="fa-solid fa-chevron-left"></i></button>
                <h2 className="font-black uppercase text-lg italic tracking-tighter text-green-500">Báo cáo lớp</h2>
                <div className="w-12"></div>
            </header>
            <div className="glass p-10 rounded-[3.5rem] border-t-8 border-green-500 bg-green-500/5 mb-10 shadow-2xl relative">
                <p className="text-xs font-black opacity-40 uppercase mb-2">Tồn quỹ lớp thực tế</p>
                <h3 className="text-5xl font-black text-white tracking-tighter">{stats.classBalance.toLocaleString()}đ</h3>
                <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-white">
                    <div className="flex justify-between text-[10px] font-bold uppercase"><span className="opacity-40">Thu quỹ tuần:</span><span className="text-blue-400">+{stats.totalWeeklyIncome.toLocaleString()}đ</span></div>
                    <div className="flex justify-between text-[10px] font-bold uppercase"><span className="opacity-40">Tổng đã chi:</span><span className="text-red-400">-{stats.totalExpense.toLocaleString()}đ</span></div>
                </div>
                <i className="fa-solid fa-piggy-bank absolute -right-4 -bottom-4 text-7xl opacity-[0.03]"></i>
            </div>
            <p className="text-xs font-black opacity-30 uppercase tracking-[0.3em] mb-6 ml-4 text-orange-500 italic">Quỹ Đột Xuất (Tách riêng)</p>
            <div className="space-y-5">
                {specialFunds.map(f => {
                    const isDone = f.status === 'done';
                    const count = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
                    return (
                        <div key={f.id} className={`glass p-8 rounded-[3rem] border border-white/5 flex justify-between items-center transition-all ${isDone ? 'opacity-30 grayscale' : 'bg-orange-500/5 border-orange-500/20'}`}>
                            <div>
                                <h4 className={`font-black text-base uppercase ${isDone ? 'line-through opacity-50' : 'text-white'}`}>{f.name}</h4>
                                <p className="text-xs font-bold text-orange-400">Đã thu: {(count * (f.amount || 0)).toLocaleString()}đ</p>
                            </div>
                            <button onClick={() => db.collection("special_funds").doc(f.id).update({status: isDone ? 'pending' : 'done'}).catch(err => alert("Lỗi mạng!"))}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${isDone ? 'bg-green-600 text-white shadow-lg shadow-green-500/40' : 'glass text-gray-600'}`}>
                                <i className={`fa-solid ${isDone ? 'fa-check-double' : 'fa-check'}`}></i>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return null;
};
