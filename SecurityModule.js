<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>10A7 COMMAND CENTER</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=Inter:wght@400;600;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #020617; color: #f8fafc; }
        .hero-gradient { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .xp-gradient { background: linear-gradient(90deg, #0071e3, #40b3ff); }
        .card-shadow { box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script src="AdminModule.js" type="text/babel"></script>
    <script src="TreasuryModule.js" type="text/babel"></script>
    <script src="LeaderModule.js" type="text/babel"></script>
    <script src="StudentModule.js" type="text/babel"></script>
    <script src="SecurityModule.js" type="text/babel"></script>

    <script type="text/babel">
        const { useState, useEffect } = React;
        const firebaseConfig = { /* Giữ nguyên config Firebase của Thầy/Cô */ };
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        const App = () => {
            const [role, setRole] = useState(null);
            const [pass, setPass] = useState("");
            const [students, setStudents] = useState([]);
            const [currentUser, setCurrentUser] = useState(null);

            useEffect(() => {
                db.collection("students").orderBy("group").onSnapshot(s => setStudents(s.docs.map(d => ({id: d.id, ...d.data()}))));
            }, []);

            const handleLogin = () => {
                const p = pass.trim().toUpperCase();
                if (p === "10A7GV") setRole("GV");
                else if (p === "10A7BANK") setRole("TQ");
                else if (p === "10A7LT") setRole("LT");
                else if (p === "10A7KEY") setRole("SECURITY"); // Mã vào trang Quản lý mật khẩu
                else {
                    const found = students.find(s => (s.passcode || "").toUpperCase() === p);
                    if (found) { setRole("STUDENT"); setCurrentUser(found); }
                    else alert("MÃ KHÔNG ĐÚNG!");
                }
                setPass("");
            };

            const logout = () => { setRole(null); setCurrentUser(null); };

            return (
                <div className="max-w-md mx-auto min-h-screen">
                    {!role ? (
                        <div className="h-screen flex items-center justify-center p-8">
                            <div className="w-full max-w-sm space-y-8 text-center">
                                <h1 className="text-4xl font-black italic tracking-tighter">10A7<span className="text-indigo-500">.</span>OS</h1>
                                <input type="password" placeholder="MẬT MÃ" className="w-full p-4 glass rounded-3xl text-center font-bold text-xl outline-none"
                                    value={pass} onChange={(e) => setPass(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} />
                                <button onClick={handleLogin} className="w-full py-5 hero-gradient rounded-3xl font-black uppercase shadow-lg active:scale-95 transition-all">Xác nhận</button>
                            </div>
                        </div>
                    ) : role === "GV" ? (
                        <AdminModule students={students} db={db} logout={logout} />
                    ) : role === "STUDENT" ? (
                        <StudentModule student={currentUser} logout={logout} />
                    ) : role === "SECURITY" ? (
                        <SecurityModule students={students} db={db} logout={logout} />
                    ) : role === "TQ" ? (
                        <TreasuryModule students={students} db={db} logout={logout} />
                    ) : (
                        <LeaderModule students={students} db={db} logout={logout} />
                    )}
                </div>
            );
        };
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
