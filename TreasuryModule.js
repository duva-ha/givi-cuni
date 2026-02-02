// Tìm đến phần giao diện Đột xuất (if mode === 'special') và thay thế bằng đoạn này:

    // 5. GIAO DIỆN ĐỘT XUẤT (HOÀN CHỈNH)
    if (mode === 'special') return (
        <div className="pb-20 animate-fadeIn">
            <header className="p-6 sticky top-0 bg-[#020617]/90 backdrop-blur-xl z-50 flex justify-between items-center border-b border-white/5">
                <button onClick={() => { setMode(null); setSelectedSpecial(null); }} className="text-gray-400 font-bold text-xs">
                    <i className="fa-solid fa-chevron-left mr-2"></i>MENU
                </button>
                <h2 className="font-black italic uppercase text-sm">THU ĐỘT XUẤT</h2>
                <div className="w-10"></div>
            </header>

            {!selectedSpecial ? (
                /* MÀN HÌNH DANH SÁCH CÁC KHOẢN THU */
                <div className="p-4 space-y-4">
                    {/* Form tạo khoản thu mới */}
                    <div className="glass p-6 rounded-[2rem] border-dashed border-2 border-orange-500/20 bg-orange-500/5">
                        <input id="spN" placeholder="TÊN KHOẢN THU (VD: LIÊN HOAN)" className="w-full bg-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase mb-3" />
                        <input id="spA" type="number" placeholder="SỐ TIỀN MỖI HS" className="w-full bg-white/5 p-4 rounded-xl outline-none font-black text-orange-400 mb-4" />
                        <button onClick={() => {
                            const n = document.getElementById('spN').value; const a = document.getElementById('spA').value;
                            if(n && a) {
                                db.collection("special_funds").add({ name: n.toUpperCase(), amount: parseInt(a), date: new Date(), payments: {} });
                                document.getElementById('spN').value=""; document.getElementById('spA').value="";
                            }
                        }} className="w-full py-4 bg-orange-600 rounded-2xl font-black uppercase text-xs">Tạo đợt thu mới +</button>
                    </div>

                    {/* Danh sách các đợt thu đã tạo */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest ml-2 text-orange-500">Đang thực hiện</p>
                        {specialFunds.map(f => (
                            <div key={f.id} onClick={() => setSelectedSpecial(f)} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5 active:scale-95 transition-all">
                                <div>
                                    <h4 className="font-black text-sm uppercase">{f.name}</h4>
                                    <p className="text-[10px] font-bold text-orange-400">{f.amount?.toLocaleString()}đ / HS</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black opacity-30 italic">{Object.values(f.payments || {}).filter(v => v === true).length}/{students.length}</span>
                                    <i className="fa-solid fa-chevron-right text-gray-700"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* MÀN HÌNH CHI TIẾT DANH SÁCH HS ĐÓNG TIỀN CHO KHOẢN ĐÃ CHỌN */
                <div className="p-4 animate-fadeIn">
                    <div className="flex justify-between items-end mb-6 px-2">
                        <button onClick={() => setSelectedSpecial(null)} className="text-orange-500 font-black text-[10px] uppercase underline"> Quay lại danh sách</button>
                        <button onClick={() => { if(window.confirm("Xóa đợt thu này?")) { db.collection("special_funds").doc(selectedSpecial.id).delete(); setSelectedSpecial(null); }}} className="text-red-500/30 hover:text-red-500"><i className="fa-solid fa-trash-can"></i></button>
                    </div>
                    
                    <div className="glass p-6 rounded-[2.5rem] mb-6 border-l-4 border-orange-500 bg-orange-500/5">
                        <h3 className="font-black text-xl uppercase leading-none mb-2">{selectedSpecial.name}</h3>
                        <p className="text-xs font-bold opacity-40">Mức đóng: {selectedSpecial.amount?.toLocaleString()}đ</p>
                    </div>

                    <div className="space-y-3">
                        {students.map(s => {
                            const isPaid = selectedSpecial.payments && selectedSpecial.payments[s.id] === true;
                            return (
                                <div key={s.id} className="glass p-5 rounded-[2.2rem] flex justify-between items-center border border-white/5">
                                    <span className="font-black text-sm uppercase">{s.name}</span>
                                    <button onClick={() => db.collection("special_funds").doc(selectedSpecial.id).update({[`payments.${s.id}`]: !isPaid})} 
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all ${isPaid ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-600'}`}>
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
