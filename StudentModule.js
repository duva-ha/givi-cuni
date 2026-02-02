// StudentModule.js
const StudentModule = ({ student, logout }) => {
    // Tránh lỗi nếu dữ liệu học sinh chưa tải kịp
    if (!student) return (
        <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
            <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest">Đang tải hồ sơ Hero...</p>
        </div>
    );

    // --- LOGIC TÍNH TOÁN LEVEL ---
    // Cứ 500 XP là lên 1 Level (Bạn có thể đổi số 500 thành số khác nếu muốn)
    const XP_PER_LEVEL = 500;
    const currentLevel = Math.floor((student.totalXp || 0) / XP_PER_LEVEL) + 1;
    const currentXpInLevel = (student.totalXp || 0) % XP_PER_LEVEL;
    const nextLevelXp = XP_PER_LEVEL;
    const xpPercentage = (currentXpInLevel / nextLevelXp) * 100;
    const remainingXp = nextLevelXp - currentXpInLevel;

    return (
        <div className="max-w-md mx-auto min-h-screen p-6 animate-fadeIn bg-[#f5f5f7]">
            {/* Header */}
            <header className="flex justify-between items-center mb-10 pt-6">
                <h1 className="text-3xl font-extrabold tracking-tighter text-[#1d1d1f]">
                    10A7<span className="text-[#0071e3]">XP</span>
                </h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        <i className="fa-solid fa-fire text-orange-500"></i>
                        <span className="font-bold text-xs">12 Ngày</span>
                    </div>
                    <button onClick={logout} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-power-off"></i>
                    </button>
                </div>
            </header>

            {/* Main Hero Card (MyClass Style) */}
            <div className="bg-white rounded-[2.5rem] p-8 card-shadow mb-8 relative overflow-hidden border border-gray-50">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                Tổ {student.group || "?"} • Chiến binh
                            </p>
                            <h2 className="text-2xl font-black text-[#1d1d1f] tracking-tight">{student.name}</h2>
                        </div>
                        <div className="bg-[#1d1d1f] text-white rounded-xl px-3 py-1.5 font-extrabold text-sm">
                            Lv.{currentLevel}
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between text-[10px] font-extrabold mb-2 uppercase tracking-tighter">
                            <span className="text-[#0071e3]">Tiến trình thăng cấp</span>
                            <span className="text-gray-400">{currentXpInLevel} / {nextLevelXp} XP</span>
                        </div>
                        <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full xp-gradient transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,113,227,0.3)]"
                                style={{ width: `${xpPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-4 italic font-medium">
                            Cần {remainingXp} XP nữa để đạt Cấp độ {currentLevel + 1}
                        </p>
                    </div>
                </div>
                
                {/* Trang trí nền số Level lớn */}
                <div className="absolute -right-6 -top-10 text-gray-100 opacity-30 text-[12rem] font-black select-none pointer-events-none">
                    {currentLevel}
                </div>
            </div>

            {/* Chỉ số Quỹ lớp (Mới) */}
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Tài chính cá nhân</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className={`p-5 rounded-[2rem] card-shadow flex flex-col gap-1 border-b-4 ${student.funds?.week_01 ? 'bg-green-50/50 border-green-500' : 'bg-red-50/50 border-red-500'}`}>
                    <span className="text-[9px] font-black opacity-40 uppercase">Quỹ tuần hiện tại</span>
                    <span className={`text-xs font-black ${student.funds?.week_01 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.funds?.week_01 ? 'ĐÃ HOÀN THÀNH' : 'CHƯA ĐÓNG'}
                    </span>
                </div>
                <div className="bg-white p-5 rounded-[2rem] card-shadow flex flex-col gap-1 border-b-4 border-blue-500">
                    <span className="text-[9px] font-black opacity-40 uppercase">Tổng tích lũy</span>
                    <span className="text-xs font-black text-blue-600">{(student.totalXp || 0).toLocaleString()} XP</span>
                </div>
            </div>

            {/* Đấu trường (Leaderboard Preview) */}
            <div className="mt-10">
                <div className="flex justify-between items-center mb-4 ml-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đấu trường 10A7</p>
                    <i className="fa-solid fa-trophy text-yellow-500 text-xs"></i>
                </div>
                <div className="bg-white rounded-[2rem] p-6 card-shadow border border-gray-50 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                        <i className="fa-solid fa-ranking-star text-xl"></i>
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Thứ hạng của bạn</p>
                    <p className="text-xl font-black text-[#1d1d1f]">Hạng {student.rank || '?'}</p>
                </div>
            </div>
        </div>
    );
};
