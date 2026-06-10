"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const styles = `
    :root {
        --primary-color: #1a1a1a;
        --secondary-color: #f7f9fc;
        --accent-color: #4a90e2;
        --text-color: #333;
        --border-color: #e0e0e0;
        --error-color: #d32f2f;
        --success-color: #388e3c;
        --white-color: #ffffff;
    }
    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
        background-color: var(--secondary-color);
        color: var(--text-color);
    }
    .app-container { display: flex; min-height: 100vh; }
    
    /* --- Auth Page --- */
    .auth-container { display: flex; justify-content: center; align-items: center; width: 100%; min-height: 100vh; background-color: #f0f2f5; }
    .auth-card { background: var(--white-color); padding: 2.5rem; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; text-align: center; }
    .auth-title { font-size: 2rem; font-weight: 600; margin-bottom: 0.5rem; }
    .auth-subtitle { color: #666; margin-bottom: 2rem; }
    .auth-form { display: flex; flex-direction: column; gap: 1rem; }
    .auth-input { padding: 0.8rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 1rem; }
    .auth-button { padding: 0.9rem; border: none; border-radius: 6px; background: var(--primary-color); color: var(--white-color); font-size: 1rem; font-weight: 500; cursor: pointer; transition: background 0.2s; margin-top: 1rem; }
    .auth-button:hover { background: #333; }
    .auth-toggle { margin-top: 1.5rem; color: #666; }
    .toggle-link { background: none; border: none; color: var(--accent-color); font-weight: 600; cursor: pointer; padding: 0; }
    .message { margin-top: 1rem; padding: 0.8rem; border-radius: 6px; text-align: center; }
    .error-message { color: var(--error-color); background-color: #ffebee; }
    .success-message { color: var(--success-color); background-color: #e8f5e9; }

    /* --- Main Layout --- */
    .sidebar { width: 240px; background: var(--white-color); padding: 1.5rem; display: flex; flex-direction: column; border-right: 1px solid var(--border-color); box-shadow: 2px 0 5px rgba(0,0,0,0.05); }
    .sidebar-header { font-size: 1.5rem; font-weight: 600; margin-bottom: 2rem; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 0.5rem; flex-grow: 1; }
    .sidebar-nav button { background: none; border: none; text-align: left; padding: 0.8rem 1rem; font-size: 1rem; border-radius: 6px; cursor: pointer; transition: background 0.2s, color 0.2s; }
    .sidebar-nav button.active { background: var(--primary-color); color: var(--white-color); }
    .sidebar-nav button:not(.active):hover { background: var(--secondary-color); }

    /* --- Main Content --- */
    .main-content { flex-grow: 1; padding: 2rem 3rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 600; }
    .header-actions { display: flex; gap: 1rem; align-items: center; }
    .card { background: var(--white-color); border-radius: 8px; border: 1px solid var(--border-color); }
    .card-header { padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .card-title { font-size: 1.25rem; font-weight: 600; }
    .card-content { padding: 1.5rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.8rem 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
    .table th { font-weight: 500; color: #666; }
    .actions-cell { text-align: right; white-space: nowrap; }
    .actions-cell button { margin-left: 0.5rem; }

    /* --- Components --- */
    .button { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .button:hover { opacity: 0.85; }
    .button-primary { background: var(--primary-color); color: var(--white-color); }
    .button-outline { background: var(--white-color); color: var(--text-color); border: 1px solid var(--border-color); }
    .button-danger { background: var(--error-color); color: var(--white-color); }
    .input, .select { padding: 0.7rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; width: 100%; box-sizing: border-box; }

    /* --- Modal --- */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: var(--white-color); padding: 2rem; border-radius: 8px; width: 100%; max-width: 450px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-title { font-size: 1.5rem; font-weight: 600; }
    .modal-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .modal-body { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
    .form-group label { font-weight: 500; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.8rem; margin-top: 1.5rem; }

    /* --- Dashboard Stats --- */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    .stat-card { background: var(--white-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.5rem; }
    .stat-title { font-size: 1rem; color: #666; margin-bottom: 0.5rem; }
    .stat-value { font-size: 2.5rem; font-weight: 600; }
`;

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

type Room = { id: number; number: string; capacity: number; rent: number; status: string; };
type Tenant = { id: number; name: string; contact: string; joinDate: string; room: Room | null; };
type Payment = { id: number; amount: number; month: number; year: number; status: string; tenant: { name: string } };
type Complaint = { id: number; description: string; status: string; date: string; tenant: { name: string } };
type DashboardStats = { totalRooms: number; totalTenants: number; rentCollected: number; pendingComplaints: number };

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
    };

    return (
        <>
            <style>{styles}</style>
            {isLoggedIn ? <PgManagementDashboard onLogout={handleLogout} /> : <AuthPage onLoginSuccess={handleLoginSuccess} />}
        </>
    );
}

//Authentication Page
function AuthPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const url = isLoginView ? '/auth/login' : '/auth/register';
        const payload = isLoginView ? { username, password } : { username, password, fullName };

        try {
            const response = await api.post(url, payload);
            if (isLoginView) {
                if (response.status === 200) {
                    onLoginSuccess();
                }
            } else {
                setSuccess('Registration successful! Please log in.');
                setIsLoginView(true);
            }
        } catch (err: any) {
            setError(err.response?.data || 'An error occurred. Please try again.');
        }
    };
    
     return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">PG Manager</h1>
                <p className="auth-subtitle">
                    {isLoginView ? "Welcome back! Manage your PG." : "Create an account to get started"}
                </p>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLoginView && (
                        <input type="text" placeholder="Full Name" className="auth-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    )}
                    <input type="text" placeholder="Username" className="auth-input" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    {error && <p className="message error-message">{error}</p>}
                    {success && <p className="message success-message">{success}</p>}
                    <button type="submit" className="auth-button">
                        {isLoginView ? 'Sign In' : 'Register'}
                    </button>
                </form>
                <div className="auth-toggle">
                    <button onClick={() => setIsLoginView(!isLoginView)} className="toggle-link">
                        {isLoginView ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}


//Dashboard
function PgManagementDashboard({ onLogout }: { onLogout: () => void }) {
    const [currentPage, setCurrentPage] = useState('Dashboard');
    
    const renderPage = () => {
        switch (currentPage) {
            case 'Dashboard': return <DashboardPage />;
            case 'Rooms': return <RoomsPage />;
            case 'Tenants': return <TenantsPage />;
            case 'Payments': return <PaymentsPage />;
            case 'Complaints': return <ComplaintsPage />;
            default: return <DashboardPage />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={onLogout} />
            <div className="main-content">{renderPage()}</div>
        </div>
    );
}

//Sidebar
function Sidebar({ currentPage, setCurrentPage, onLogout }: any) {
    const navItems = ['Dashboard', 'Rooms', 'Tenants', 'Payments', 'Complaints'];
    
     return (
        <aside className="sidebar">
            <h1 className="sidebar-header">PG Manager</h1>
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button key={item} className={currentPage === item ? 'active' : ''} onClick={() => setCurrentPage(item)}>
                        {item}
                    </button>
                ))}
            </nav>
            <button onClick={onLogout} className="button button-outline">Logout</button>
        </aside>
    );
}

//Modal
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void; }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} className="modal-close">&times;</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}

const handleApiError = (err: any, context: string, setError: (msg: string) => void) => {
    console.error(`Error in ${context}:`, err);
    if (err.message === 'Network Error') {
        setError('Network Error: Could not connect to the backend. Please ensure the Spring Boot server is running and CORS is configured.');
    } else {
        setError(err.response?.data?.message || err.response?.data || `Failed to ${context}. Please try again.`);
    }
};


//Page Components

function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [error, setError] = useState('');
    
    useEffect(() => {
        api.get('/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => handleApiError(err, 'fetch dashboard stats', setError));
    }, []);

    const formattedRent = (stats && stats.rentCollected != null) 
        ? stats.rentCollected.toLocaleString() 
        : '...';

    return (
        <>
            <div className="page-header"><h2 className="page-title">Dashboard</h2></div>
            {error && <p className="message error-message">{error}</p>}
            <div className="stats-grid">
                <div className="stat-card"><h3 className="stat-title">Total Rooms</h3><p className="stat-value">{stats?.totalRooms ?? '...'}</p></div>
                <div className="stat-card"><h3 className="stat-title">Total Tenants</h3><p className="stat-value">{stats?.totalTenants ?? '...'}</p></div>
                <div className="stat-card"><h3 className="stat-title">Rent Collected (This Month)</h3><p className="stat-value">₹{formattedRent}</p></div>
                <div className="stat-card"><h3 className="stat-title">Pending Complaints</h3><p className="stat-value">{stats?.pendingComplaints ?? '...'}</p></div>
            </div>
        </>
    );
}

//Rooms Page

function RoomForm({ room, onSubmit, onCancel }: { room?: Room | null; onSubmit: (data: any) => void; onCancel: () => void; }) {
    const [number, setNumber] = useState(room?.number || '');
    const [capacity, setCapacity] = useState(room?.capacity || 1);
    const [rent, setRent] = useState(room?.rent || 0);
    const [status, setStatus] = useState(room?.status || 'Available');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ number, capacity, rent, status });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Room Number</label><input className="input" value={number} onChange={e => setNumber(e.target.value)} required /></div>
            <div className="form-group"><label>Capacity</label><input type="number" className="input" min="1" value={capacity} onChange={e => setCapacity(Number(e.target.value))} required /></div>
            <div className="form-group"><label>Rent</label><input type="number" className="input" min="0" value={rent} onChange={e => setRent(Number(e.target.value))} required /></div>
            <div className="form-group"><label>Status</label><select className="select" value={status} onChange={e => setStatus(e.target.value)}><option value="Available">Available</option><option value="Occupied">Occupied</option></select></div>
            <div className="modal-footer"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">Save Room</button></div>
        </form>
    );
}

function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const fetchRooms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(''); // Clear previous errors
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            handleApiError(err, 'fetch rooms', setError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingRoom) {
                await api.put(`/rooms/${editingRoom.id}`, data);
            } else {
                await api.post('/rooms', data);
            }
            fetchRooms();
            closeModal();
        } catch (err) {
            handleApiError(err, 'save room', setError);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this room? Note: Cannot delete occupied rooms.')) {
            try {
                await api.delete(`/rooms/${id}`);
                fetchRooms();
            } catch (err) {
                handleApiError(err, 'delete room', setError);
            }
        }
    };
    
    const openModal = (room: Room | null = null) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingRoom(null);
        setIsModalOpen(false);
    };

    return (
        <>
            {isModalOpen && (
                <Modal title={editingRoom ? 'Edit Room' : 'Add Room'} onClose={closeModal}>
                    <RoomForm room={editingRoom} onSubmit={handleFormSubmit} onCancel={closeModal} />
                </Modal>
            )}
            <div className="page-header"><h2 className="page-title">Rooms</h2><button className="button button-primary" onClick={() => openModal()}>Add Room</button></div>
            {error && <p className="message error-message">{error}</p>}
            <div className="card">
                <div className="card-header"><h3 className="card-title">Room List</h3></div>
                <div className="card-content">
                    {isLoading ? <p>Loading...</p> :
                    <table className="table">
                        <thead><tr><th>Room Number</th><th>Capacity</th><th>Rent</th><th>Status</th><th className="actions-cell">Actions</th></tr></thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td>{room.number}</td><td>{room.capacity}</td><td>₹{room.rent.toLocaleString()}</td><td>{room.status}</td>
                                    <td className="actions-cell"><button className="button button-outline" onClick={() => openModal(room)}>Edit</button><button className="button button-danger" onClick={() => handleDelete(room.id)} disabled={room.status === 'Occupied'}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    );
}


//Tenants Page

function TenantForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void; }) {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [joinDate, setJoinDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, contact, joinDate });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="form-group"><label>Contact</label><input className="input" value={contact} onChange={e => setContact(e.target.value)} required /></div>
            <div className="form-group"><label>Join Date</label><input type="date" className="input" value={joinDate} onChange={e => setJoinDate(e.target.value)} required /></div>
            <div className="modal-footer"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">Save Tenant</button></div>
        </form>
    );
}

function AssignRoomForm({ availableRooms, onSubmit, onCancel }: { availableRooms: Room[], onSubmit: (data: any) => void; onCancel: () => void; }) {
    const [roomId, setRoomId] = useState<number | ''>('');

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ roomId })}}>
            <div className="form-group">
                <label>Available Rooms</label>
                <select className="select" value={roomId} onChange={e => setRoomId(Number(e.target.value))} required>
                    <option value="" disabled>Select a room</option>
                    {availableRooms.map(r => <option key={r.id} value={r.id}>{r.number} (Rent: ₹{r.rent})</option>)}
                </select>
            </div>
            <div className="modal-footer"><button type="button" className="button button-outline" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary">Assign Room</button></div>
        </form>
    );
}


function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [assigningTenant, setAssigningTenant] = useState<Tenant | null>(null);

    const fetchTenantsAndRooms = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const [tenantsRes, roomsRes] = await Promise.all([
                api.get('/tenants'),
                api.get('/rooms?status=Available')
            ]);
            setTenants(tenantsRes.data);
            setAvailableRooms(roomsRes.data);
        } catch (err) {
            handleApiError(err, 'fetch tenants or rooms', setError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenantsAndRooms();
    }, [fetchTenantsAndRooms]);

    const handleAddTenant = async (data: any) => {
        try {
            await api.post('/tenants', data);
            fetchTenantsAndRooms();
            setIsAddModalOpen(false);
        } catch (err) {
            handleApiError(err, 'add tenant', setError);
        }
    };
    
    const handleAssignRoom = async (data: any) => {
        if (!assigningTenant) return;
        try {
            await api.patch(`/tenants/${assigningTenant.id}/assign-room`, data);
            fetchTenantsAndRooms();
            setAssigningTenant(null);
        } catch (err) {
            handleApiError(err, 'assign room', setError);
        }
    };
    
    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure? This will also make their room available.')) {
            try {
                await api.delete(`/tenants/${id}`);
                fetchTenantsAndRooms();
            } catch (err) {
                handleApiError(err, 'delete tenant', setError);
            }
        }
    };

    return (
        <>
            {isAddModalOpen && (
                <Modal title="Add New Tenant" onClose={() => setIsAddModalOpen(false)}>
                    <TenantForm onSubmit={handleAddTenant} onCancel={() => setIsAddModalOpen(false)} />
                </Modal>
            )}
            {assigningTenant && (
                 <Modal title={`Assign Room to ${assigningTenant.name}`} onClose={() => setAssigningTenant(null)}>
                    <AssignRoomForm availableRooms={availableRooms} onSubmit={handleAssignRoom} onCancel={() => setAssigningTenant(null)} />
                </Modal>
            )}

            <div className="page-header"><h2 className="page-title">Tenants</h2><button className="button button-primary" onClick={() => setIsAddModalOpen(true)}>Add Tenant</button></div>
            {error && <p className="message error-message">{error}</p>}
            <div className="card">
                <div className="card-header"><h3 className="card-title">Tenant List</h3></div>
                <div className="card-content">
                    {isLoading ? <p>Loading...</p> :
                    <table className="table">
                        <thead><tr><th>Name</th><th>Contact</th><th>Join Date</th><th>Room</th><th className="actions-cell">Actions</th></tr></thead>
                        <tbody>
                            {tenants.map(t => (
                                <tr key={t.id}>
                                    <td>{t.name}</td><td>{t.contact}</td><td>{t.joinDate}</td><td>{t.room?.number || 'Unassigned'}</td>
                                    <td className="actions-cell">
                                        {!t.room && <button className="button button-outline" onClick={() => setAssigningTenant(t)}>Assign Room</button>}
                                        <button className="button button-danger" onClick={() => handleDelete(t.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    );
}

//Payments Page

function PaymentForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void, onCancel: () => void }) {
    const [tenantName, setTenantName] = useState("");
    const [month, setMonth] = useState("");
    const [amount, setAmount] = useState(0);
    const [status, setStatus] = useState("Paid");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ tenantName, month, amount, status });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Tenant Name</label>
                <input className="input" value={tenantName} onChange={e => setTenantName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Month</label>
                <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} required />
            </div>
            <div className="form-group">
                <label>Amount</label>
                <input type="number" className="input" min="0" value={amount} onChange={e => setAmount(Number(e.target.value))} required />
            </div>
            <div className="form-group">
                <label>Status</label>
                <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>
            <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="button button-primary">Save Payment</button>
            </div>
        </form>
    );
}

function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(''); // Clear previous errors
            const res = await api.get('/payments');
            setPayments(res.data);
        } catch (err) {
            handleApiError(err, 'fetch payments', setError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleAddPayment = async (data: any) => {
        try {
            const [year, month] = data.month.split('-');
            const payload = {
                tenantName: data.tenantName,
                amount: data.amount,
                status: data.status,
                month: parseInt(month, 10),
                year: parseInt(year, 10)
            };
            await api.post('/payments', payload);
            fetchPayments();
            setIsModalOpen(false);
        } catch (err) {
            handleApiError(err, 'add payment', setError);
        }
    };

    const handleUpdateStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
        try {
            await api.patch(`/payments/${id}`, { status: newStatus });
            fetchPayments();
        } catch (err) {
            handleApiError(err, 'update payment status', setError);
        }
    };

    const totalCollectedThisMonth = payments
        .filter(p => {
            const now = new Date();
            return p.month === now.getMonth() + 1 && p.year === now.getFullYear() && p.status === 'Paid';
        })
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <>
            {isModalOpen && (
                <Modal title="Add Payment" onClose={() => setIsModalOpen(false)}>
                    <PaymentForm onSubmit={handleAddPayment} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            <div className="page-header">
                <h2 className="page-title">Payments</h2>
                <div className="header-actions">
                    <button className="button button-primary" onClick={() => setIsModalOpen(true)}>Add Payment</button>
                </div>
            </div>
            {error && <p className="message error-message">{error}</p>}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Payment History</h3>
                    <span>This month collected: <strong>₹{totalCollectedThisMonth.toLocaleString()}</strong></span>
                </div>
                <div className="card-content">
                    {isLoading ? <p>Loading...</p> :
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tenant Name</th>
                                <th>Month/Year</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{p.tenant?.name || 'N/A'}</td> {}
                                    <td>{`${p.month}/${p.year}`}</td>
                                    <td>₹{p.amount.toLocaleString()}</td>
                                    <td>{p.status}</td>
                                    <td className="actions-cell">
                                        {p.status === 'Pending' && (
                                            <button className="button button-outline" onClick={() => handleUpdateStatus(p.id, p.status)}>Mark as Paid</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    );
}


function ComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchComplaints = useCallback(async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await api.get('/complaints');
            setComplaints(response.data);
        } catch (err) {
            handleApiError(err, 'fetch complaints', setError);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleAddComplaint = async (data: { tenantName: string, description: string }) => {
        try {
            await api.post('/complaints', data);
            fetchComplaints();
            setIsModalOpen(false);
        } catch (err: any) {
            handleApiError(err, 'add complaint', setError);
        }
    };
    
    const handleUpdateStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Open' ? 'Resolved' : 'Open';
        try {
            await api.patch(`/complaints/${id}`, { status: newStatus });
            fetchComplaints();
        } catch (err) {
             handleApiError(err, 'update status', setError);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this complaint?')) {
            try {
                await api.delete(`/complaints/${id}`);
                fetchComplaints();
            } catch (err) {
                handleApiError(err, 'delete complaint', setError);
            }
        }
    };

    return (
        <>
            {isModalOpen && (
                <Modal title="Add New Complaint" onClose={() => setIsModalOpen(false)}>
                    <ComplaintForm onSubmit={handleAddComplaint} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
            <div className="page-header">
                <h2 className="page-title">Complaints</h2>
                <div className="header-actions">
                    <button className="button button-primary" onClick={() => setIsModalOpen(true)}>Add Complaint</button>
                </div>
            </div>
            {error && <p className="message error-message">{error}</p>}
            <div className="card">
                <div className="card-header"><h3 className="card-title">Complaint List</h3></div>
                <div className="card-content">
                    {isLoading ? <p>Loading...</p> :
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tenant</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map(c => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.tenant?.name || 'N/A'}</td> {}
                                    <td>{c.description}</td>
                                    <td>{c.date}</td>
                                    <td>{c.status}</td>
                                    <td className="actions-cell">
                                        <button className="button button-outline" onClick={() => handleUpdateStatus(c.id, c.status)}>
                                            {c.status === 'Open' ? 'Mark Resolved' : 'Reopen'}
                                        </button>
                                        <button className="button button-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    );
}

function ComplaintForm({ onSubmit, onCancel }: { onSubmit: (data: { tenantName: string, description: string }) => void, onCancel: () => void }) {
    const [tenantName, setTenantName] = useState("");
    const [description, setDescription] = useState("");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ tenantName, description });
            }}
        >
            <div className="form-group">
                <label htmlFor="tenant-name">Tenant Name</label>
                <input id="tenant-name" className="input" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
            </div>
             <div className="form-group">
                <label htmlFor="description">Description</label>
                <input id="description" className="input" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="modal-footer">
                <button type="button" className="button button-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="button button-primary">Save Complaint</button>
            </div>
        </form>
    );
}
