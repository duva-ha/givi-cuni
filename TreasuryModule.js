// TreasuryModule.js - Bản nâng cấp: Nhập tiền theo tuần & Đóng đủ cả lớp
const TreasuryModule = ({ students = [], specialFunds = [], expenses = [], weeklyFees = {}, db, logout }) => {
    const [mode, setMode] = React.useState(null); 
    const [currentWeek, setCurrentWeek] = React.useState(1);
    const [selectedSpecialId, setSelectedSpecialId] = React.useState(null);

    const getWeekKey = (num) => `week_${num < 10 ? '0' + num : num}`;
    const weekKey = getWeekKey(currentWeek);

    // --- LOGIC TÍNH TOÁN BÁO CÁO ---
    const getReportData = () => {
        const totalWeeklyIncome = students.reduce((acc, s) => {
            if (!s.funds) return acc;
            let sum = 0;
            Object.keys(s.funds).forEach(wk => {
                if (s.funds[wk] === true) {
                    // Lấy số tiền riêng của tuần đó, nếu không có mặc định là 5000
                    sum += (weeklyFees[wk] || 5000);
                }
            });
            return acc + sum;
        }, 0);

        const totalSpecialIncome = specialFunds.reduce((acc, f) => {
            const count = f.payments ? Object.values(f.payments).filter(v => v === true).length : 0;
            return acc + (count * (f.amount || 0));
        }, 0);

        const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        return {
            totalWeeklyIncome,
            totalSpecialIncome,
            totalExpense,
            balance: totalWeeklyIncome + totalSpecialIncome - totalExpense
        };
    };

    const stats = getReportData();

    // Hàm ghi nhận đóng đủ cả lớp
    const markAllPaid = async () => {
        if (!window.confirm(`Xác nhận cả lớp đã đóng đủ quỹ Tuần ${currentWeek}?`)) return;
        const batch = db.batch();
        students.forEach(s => {
            batch.update(db.collection("students").doc(s.id), {
                [`funds.${weekKey}`]: true
            });
        });
        await batch.commit();
    };

    // 1. MENU CHÍNH
    if (!mode) return (
        <div className="min-h-screen flex flex-col justify-center p-6 space-y-4 animate-fadeIn text-white">
            <h2 className="text-center text-2xl font-black italic mb-6 uppercase tracking-tighter">Treasury Center</h2>
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setMode('weekly')} className="glass p-6 rounded-[2.5rem] flex flex-col items-center gap-4 border-b-4 border-blue-500 active:scale-95">
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
            <button onClick={logout} className="mt-8 opacity-30 text-[10px] font-bold uppercase underline text-center">Thoát hệ thống</button>
        </div>
    );

    // 2. GIAO DIỆN QUỸ TUẦN (ĐÃ NÂNG CẤP)
    if (mode === 'weekly') return (
        <div className="pb-20 animate-fadeIn text-white">
            <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                <button onClick={() => setMode(null)} className="text-gray-400 font-bold text-xs"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">Quỹ Tuần {currentWeek}</h2>
                <div className="w-10"></div>
            </header>

            {/* Chọn tuần */}
            <div className="flex overflow-x-auto gap-3 py-6 px-4 no-scrollbar bg-white/5">
                {[...Array(35)].map((_, i) => (
                    <div key={i} onClick={() => setCurrentWeek(i+1)} 
                        className={`min-w-[65px] h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${currentWeek === i+1 ? 'bg-blue-600 border-blue-400 shadow-lg' : 'glass opacity-30'}`}>
                        <span className="text-[10px] font-bold">T.</span>
                        <span className="text-xl font-black">{i+1}</span>
                    </div>
                ))}
            </div>

            <div className="p-4 space-y-4">
                {/* Cấu hình số tiền & Nút đóng nhanh */}
                <div className="glass p-5 rounded-[2rem] border border-blue-500/20 bg-blue-500/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] font-black opacity-40 mb-1 uppercase">Tiền quỹ tuần này (đ)</p>
                            <input 
                                type="number" 
                                value={weeklyFees[weekKey] || ""} 
                                placeholder="5,000"
                                onChange={(e) => db.collection("settings").doc("weekly_fees").set({ [weekKey]: parseInt(e.target.value) || 0 }, { merge: true })}
                                className="w-full bg-white/5 p-3 rounded-xl outline-none font-black text-blue-400 text-lg"
                            />
                        </div>
                        <button onClick={markAllPaid} className="h-full px-6 bg-blue-600 rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-all py-4 shadow-lg shadow-blue-500/20">
                            Đóng đủ <br/> cả lớp
                        </button>
                    </div>
                </div>

                {/* Danh sách học sinh */}
                <div className="space-y-3 h-[50vh] overflow-y-auto no-scrollbar pb-10">
                    {students.map(s => {
                        const isPaid = s.funds && s.funds[weekKey] === true;
                        return (
                            <div key={s.id} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5">
                                <span className="font-black text-sm uppercase">{s.name}</span>
                                <button onClick={() => db.collection("students").doc(s.id).update({[`funds.${weekKey}`]: !isPaid})} 
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isPaid ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-600'}`}>
                                    <i className={`fa-solid ${isPaid ? 'fa-check' : 'fa-hand-holding-dollar'}`}></i>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // 3. GIAO DIỆN ĐỘT XUẤT (Giữ nguyên bản hoàn chỉnh trước đó)
    if (mode === 'special') {
        const currentFund = specialFunds.find(f => f.id === selectedSpecialId);
        return (
            <div className="pb-20 animate-fadeIn text-white">
                <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                    <button onClick={() => { setMode(null); setSelectedSpecialId(null); }} className="text-gray-400 font-bold text-xs"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                    <h2 className="font-black italic uppercase text-sm">THU ĐỘT XUẤT</h2>
                    <div className="w-10"></div>
                </header>
                {!currentFund ? (
                    <div className="p-4 space-y-4">
                        <div className="glass p-6 rounded-[2rem] border-dashed border-2 border-orange-500/20 bg-orange-500/5">
                            <input id="spN" placeholder="TÊN KHOẢN THU..." className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase mb-3 text-white" />
                            <input id="spA" type="number" placeholder="SỐ TIỀN MỖI HS" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-orange-400 mb-4" />
                            <button onClick={() => {
                                const n = document.getElementById('spN').value; const a = document.getElementById('spA').value;
                                if(n && a) { db.collection("special_funds").add({ name: n.toUpperCase(), amount: parseInt(a), date: new Date(), payments: {} }); }
                            }} className="w-full py-4 bg-orange-600 rounded-2xl font-black uppercase text-xs">Tạo mới +</button>
                        </div>
                        {specialFunds.map(f => (
                            <div key={f.id} onClick={() => setSelectedSpecialId(f.id)} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5 active:scale-95">
                                <div><h4 className="font-black text-sm uppercase">{f.name}</h4><p className="text-[10px] font-bold text-orange-400">{f.amount?.toLocaleString()}đ</p></div>
                                <i className="fa-solid fa-chevron-right text-gray-700"></i>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 animate-fadeIn">
                        <button onClick={() => setSelectedSpecialId(null)} className="text-orange-500 font-black text-[10px] uppercase mb-4 underline">Quay lại</button>
                        <div className="space-y-3 h-[60vh] overflow-y-auto no-scrollbar pb-10">
                            {students.map(s => {
                                const isPaid = currentFund.payments && currentFund.payments[s.id] === true;
                                return (
                                    <div key={s.id} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5">
                                        <span className="font-black text-sm uppercase">{s.name}</span>
                                        <button onClick={() => db.collection("special_funds").doc(currentFund.id).update({[`payments.${s.id}`]: !isPaid})} 
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl ${isPaid ? 'bg-orange-600' : 'bg-white/5 text-gray-600'}`}>
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

    // 4. BÁO CÁO & CHI TIÊU (Tự động cập nhật theo giá tuần mới)
    if (mode === 'expense' || mode === 'report') return (
        <div className="p-6 pb-20 animate-fadeIn text-white">
            <header className="flex justify-between items-center mb-8">
                <button onClick={() => setMode(null)} className="text-xs font-bold text-gray-400"><i className="fa-solid fa-chevron-left mr-2"></i>MENU</button>
                <h2 className="font-black italic uppercase text-sm">{mode === 'report' ? 'BÁO CÁO' : 'CHI TIÊU'}</h2><div className="w-10"></div>
            </header>
            {mode === 'report' ? (
                <div className="space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border-l-4 border-green-500 bg-green-500/5">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Tồn quỹ hiện tại</p>
                        <h3 className="text-4xl font-black text-green-400 leading-none">{stats.balance.toLocaleString()}đ</h3>
                    </div>
                    <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase">Thu Quỹ Tuần</span>
                            <span className="font-black text-blue-400">+{stats.totalWeeklyIncome.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase">Thu Đột Xuất</span>
                            <span className="font-black text-orange-400">+{stats.totalSpecialIncome.toLocaleString()}đ</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-4">
                            <span className="text-[10px] font-black text-red-400 uppercase">Tổng đã chi</span>
                            <span className="font-black text-red-500">-{stats.totalExpense.toLocaleString()}đ</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="glass p-6 rounded-[2rem] bg-red-500/5 border-l-4 border-red-500 mb-6">
                        <input id="exN" placeholder="NỘI DUNG CHI..." className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase mb-3 text-white" />
                        <input id="exA" type="number" placeholder="SỐ TIỀN" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-red-400 mb-4" />
                        <button onClick={() => {
                            const n = document.getElementById('exN').value; const a = document.getElementById('exA').value;
                            if(n && a) { db.collection("expenses").add({name: n.toUpperCase(), amount: parseInt(a), date: new Date()}); }
                        }} className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase text-xs">Xác nhận chi -</button>
                    </div>
                    {expenses.map(e => (
                        <div key={e.id} className="glass p-4 rounded-2xl flex justify-between items-center border border-white/5">
                            <div><p className="font-black text-xs uppercase">{e.name}</p><p className="text-[8px] opacity-30">{e.date?.toDate().toLocaleDateString('vi-VN')}</p></div>
                            <span className="text-red-400 font-black">-{e.amount?.toLocaleString()}đ</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return null;
};
