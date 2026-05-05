'use client';

import { useEffect, useState } from "react";
import { formatUSD } from "@/lib/currency";

interface Task {
    _id: string;
    title: string;
    description: string;
    reward: number;
    type: string;
    link?: string;
    expiryDate: string;
}

interface UserTask {
    _id: string;
    taskId: Task;
    userId: string;
    proof: string;
    proofImage?: string;
    status: string;
    submittedAt: string;
}

export default function AdminTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [submissions, setSubmissions] = useState<UserTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [submissionsPage, setSubmissionsPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const perPage = 20;
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        reward: 0,
        type: 'social',
        link: '',
        expiryDate: ''
    });

    useEffect(() => {
        fetchTasks();
        fetchSubmissions();
    }, [submissionsPage]);

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/admin/tasks');
            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const response = await fetch(`/api/admin/tasks/submissions?page=${submissionsPage}&limit=${perPage}`);
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data.submissions);
                setTotalPages(data.totalPages || 1);
                setTotalSubmissions(data.total || 0);
            }
        } catch (err) {
            console.error('Error fetching submissions:', err);
        }
    };

    const handleSubmissionAction = async (userTaskId: string, action: 'approve' | 'reject') => {
        if (!confirm(`Are you sure you want to ${action} this submission?`)) return;

        try {
            const response = await fetch('/api/admin/tasks/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userTaskId, action }),
            });

            if (response.ok) {
                fetchSubmissions();
            } else {
                alert('Failed to update submission');
            }
        } catch (err) {
            console.error('Error updating submission:', err);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                setIsCreating(false);
                setNewTask({ title: '', description: '', reward: 0, type: 'social', link: '', expiryDate: '' });
                fetchTasks();
            } else {
                alert('Failed to create task');
            }
        } catch (err) {
            console.error('Error creating task:', err);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            const response = await fetch(`/api/admin/tasks?id=${taskId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchTasks();
            }
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading tasks...</div>;

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-white text-3xl font-bold">Task Management</h1>
                        <p className="text-white/60 mt-1">Create and manage tasks</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="bg-primary text-[#112215] px-4 py-2 rounded-lg font-bold"
                    >
                        {isCreating ? 'Cancel' : 'Create New Task'}
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-8 p-6 rounded-xl border border-[#32673f] bg-[#193320]">
                        <h2 className="text-white text-xl font-bold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-white text-sm block mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-white text-sm block mb-1">Type</label>
                                <select
                                    value={newTask.type}
                                    onChange={e => setNewTask({ ...newTask, type: e.target.value })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                >
                                    <option value="social">Social Media</option>
                                    <option value="video">Video Watch</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-white text-sm block mb-1">Description</label>
                                <textarea
                                    required
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="text-white text-sm block mb-1">Reward ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={newTask.reward}
                                    onChange={e => setNewTask({ ...newTask, reward: Number(e.target.value) })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="text-white text-sm block mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newTask.expiryDate}
                                    onChange={e => setNewTask({ ...newTask, expiryDate: e.target.value })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-white text-sm block mb-1">Link (Optional)</label>
                                <input
                                    type="url"
                                    value={newTask.link}
                                    onChange={e => setNewTask({ ...newTask, link: e.target.value })}
                                    className="w-full bg-[#102215] border border-[#32673f] text-white px-4 py-2 rounded-lg"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button type="submit" className="w-full bg-primary text-[#112215] py-3 rounded-lg font-bold">
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {tasks.map(task => (
                        <div key={task._id} className="p-6 rounded-xl border border-[#32673f] bg-[#193320] flex justify-between items-start">
                            <div>
                                <h3 className="text-white text-lg font-bold">{task.title}</h3>
                                <p className="text-white/70 text-sm mb-2">{task.description}</p>
                                <div className="flex gap-4 text-sm text-white/50">
                                    <span className="text-primary font-bold">{formatUSD(task.reward)}</span>
                                    <span>{task.type}</span>
                                    <span>Expires: {new Date(task.expiryDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Submissions Section */}
                <div className="mt-12">
                    <h2 className="text-white text-2xl font-bold mb-6">Pending Submissions ({totalSubmissions} total)</h2>
                    {submissions.length === 0 ? (
                        <p className="text-white/60">No pending submissions.</p>
                    ) : (
                        <>
                            <div className="rounded-xl border border-[#32673f] bg-[#193320] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-[#102215] border-b border-[#32673f]">
                                            <tr>
                                                <th className="text-left p-4 text-white/70 font-medium">Task</th>
                                                <th className="text-left p-4 text-white/70 font-medium">User</th>
                                                <th className="text-left p-4 text-white/70 font-medium">Submitted</th>
                                                <th className="text-left p-4 text-white/70 font-medium">Reward</th>
                                                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((sub: any) => (
                                                <tr key={sub._id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="p-4">
                                                        <p className="text-white font-medium">{sub.taskId?.title || 'Unknown Task'}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-white">{sub.userId?.name || 'Unknown'}</p>
                                                        <p className="text-white/50 text-sm">{sub.userId?.email}</p>
                                                    </td>
                                                    <td className="p-4 text-white/60 text-sm">
                                                        {new Date(sub.submittedAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-primary font-bold">
                                                        {formatUSD(sub.taskId?.reward || 0)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setSelectedSubmission(sub)}
                                                                className="text-blue-400 hover:text-blue-300 text-sm font-bold"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() => handleSubmissionAction(sub._id, 'approve')}
                                                                className="text-green-400 hover:text-green-300 text-sm font-bold"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleSubmissionAction(sub._id, 'reject')}
                                                                className="text-red-400 hover:text-red-300 text-sm font-bold"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <p className="text-white/60 text-sm">
                                        Page {submissionsPage} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSubmissionsPage(p => Math.max(1, p - 1))}
                                            disabled={submissionsPage === 1}
                                            className="px-4 py-2 rounded-lg bg-[#193320] border border-[#32673f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23482c] transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setSubmissionsPage(p => Math.min(totalPages, p + 1))}
                                            disabled={submissionsPage === totalPages}
                                            className="px-4 py-2 rounded-lg bg-[#193320] border border-[#32673f] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#23482c] transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Submission Details Modal */}
                {selectedSubmission && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSubmission(null)}>
                        <div className="bg-[#193320] border border-[#32673f] rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold">{selectedSubmission.taskId?.title || 'Task Submission'}</h2>
                                    <p className="text-white/60 text-sm mt-1">
                                        Submitted by {selectedSubmission.userId?.name} on {new Date(selectedSubmission.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedSubmission(null)} className="text-white/60 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-[#102215] p-4 rounded-lg border border-[#32673f]">
                                    <p className="text-white/60 text-sm mb-2">Proof Text:</p>
                                    <p className="text-white text-sm break-all">{selectedSubmission.proof}</p>
                                </div>

                                {selectedSubmission.proofImage && (
                                    <div className="bg-[#102215] p-4 rounded-lg border border-[#32673f]">
                                        <p className="text-white/60 text-sm mb-3">Proof Image/Video:</p>
                                        {selectedSubmission.proofImage.includes('.mp4') || selectedSubmission.proofImage.includes('video') ? (
                                            <video
                                                src={selectedSubmission.proofImage}
                                                controls
                                                className="w-full rounded-lg"
                                            />
                                        ) : (
                                            <a href={selectedSubmission.proofImage} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={selectedSubmission.proofImage}
                                                    alt="Proof"
                                                    className="w-full rounded-lg cursor-pointer hover:opacity-80"
                                                />
                                            </a>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            handleSubmissionAction(selectedSubmission._id, 'approve');
                                            setSelectedSubmission(null);
                                        }}
                                        className="flex-1 bg-green-500/20 text-green-400 px-4 py-3 rounded-lg font-bold hover:bg-green-500/30 transition-colors"
                                    >
                                        Approve Submission
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleSubmissionAction(selectedSubmission._id, 'reject');
                                            setSelectedSubmission(null);
                                        }}
                                        className="flex-1 bg-red-500/20 text-red-400 px-4 py-3 rounded-lg font-bold hover:bg-red-500/30 transition-colors"
                                    >
                                        Reject Submission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
