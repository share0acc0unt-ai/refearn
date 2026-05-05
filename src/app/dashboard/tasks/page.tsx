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
    taskId: any;
    proof: string;
    status: string;
    submittedAt: string;
    approvedAt?: string;
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userTasks, setUserTasks] = useState<UserTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [proof, setProof] = useState('');
    const [proofImage, setProofImage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/user/tasks');
            if (response.ok) {
                const data = await response.json();
                setTasks(data.tasks);
                setUserTasks(data.userTasks);
            }
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                setError('Please upload an image or video file');
                return;
            }
            setSelectedFile(file);
            setError('');
        }
    };

    const uploadFile = async (): Promise<string> => {
        if (!selectedFile) return '';

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            return data.url;
        } catch (err: any) {
            throw new Error(err.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleStartTask = (task: Task) => {
        setSelectedTask(task);
        setShowModal(true);
        setError('');
        setSuccess('');
        setProof('');
        setProofImage('');
        setSelectedFile(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTask(null);
        setProof('');
        setProofImage('');
        setSelectedFile(null);
        setError('');
        setSuccess('');
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTask || !proof.trim()) {
            setError('Please provide proof of task completion');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            // Upload file if selected
            let imageUrl = '';
            if (selectedFile) {
                imageUrl = await uploadFile();
            }

            const response = await fetch('/api/user/tasks/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: selectedTask._id,
                    proof,
                    proofImage: imageUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit task');
            }

            setSuccess('Task submitted successfully! Waiting for admin approval.');
            // Close modal after 2 seconds
            setTimeout(() => {
                handleCloseModal();
                fetchTasks(); // Refresh tasks
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const getTaskStatusBadge = (status: string) => {
        const colors: any = {
            pending: 'bg-yellow-500/20 text-yellow-500',
            approved: 'bg-green-500/20 text-green-500',
            rejected: 'bg-red-500/20 text-red-500',
        };
        return colors[status] || 'bg-gray-500/20 text-gray-500';
    };

    if (loading) {
        return (
            <div className="p-8 lg:p-12">
                <div className="mx-auto max-w-7xl flex items-center justify-center h-64">
                    <p className="text-white text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12">
            <div className="mx-auto max-w-7xl">
                {/* Page Heading */}
                <div className="flex flex-wrap justify-between gap-3 mb-8">
                    <div className="flex min-w-72 flex-col gap-2">
                        <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Browse Tasks</p>
                        <p className="text-[#92c9a0] text-base font-normal leading-normal">
                            Complete tasks to earn rewards
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">Available Tasks</p>
                        <p className="text-white text-3xl font-bold">{tasks.length}</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">Submitted</p>
                        <p className="text-white text-3xl font-bold">
                            {userTasks.filter(t => t.status === 'pending').length}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                        <p className="text-white/70 text-sm mb-1">Approved</p>
                        <p className="text-primary text-3xl font-bold">
                            {userTasks.filter(t => t.status === 'approved').length}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Available Tasks */}
                    <div className="lg:col-span-2">
                        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                            Available Tasks
                        </h2>
                        {tasks.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                                <span className="material-symbols-outlined text-white/30 text-6xl mb-4 block">assignment</span>
                                <p className="text-white/70 text-lg mb-2">No tasks available</p>
                                <p className="text-white/50 text-sm">Check back later for new tasks!</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {tasks.map((task) => {
                                    const hasSubmitted = userTasks.some(ut =>
                                        (ut.taskId._id || ut.taskId) === task._id
                                    );

                                    return (
                                        <div key={task._id} className="rounded-xl border border-white/10 bg-white/5 p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-white text-lg font-bold mb-2">{task.title}</h3>
                                                    <p className="text-white/70 text-sm mb-3">{task.description}</p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-primary font-bold">{formatUSD(task.reward)}</span>
                                                        <span className="text-white/50">•</span>
                                                        <span className="text-white/60 capitalize">{task.type}</span>
                                                        {task.expiryDate && (
                                                            <>
                                                                <span className="text-white/50">•</span>
                                                                <span className="text-white/60">
                                                                    Expires: {new Date(task.expiryDate).toLocaleDateString()}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {hasSubmitted ? (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                                        Submitted
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartTask(task)}
                                                        className="px-4 py-2 rounded-lg bg-primary text-[#112215] font-bold text-sm hover:bg-primary/90 transition-colors"
                                                    >
                                                        Start Task
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* My Submissions */}
                    <div className="lg:col-span-1">
                        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                            My Submissions
                        </h2>
                        {userTasks.length === 0 ? (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
                                <p className="text-white/70 text-sm">No submissions yet</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {userTasks.map((userTask) => (
                                    <div key={userTask._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <h4 className="text-white font-medium text-sm mb-2">
                                            {userTask.taskId?.title || 'Task'}
                                        </h4>
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTaskStatusBadge(userTask.status)}`}>
                                            {userTask.status}
                                        </span>
                                        <p className="text-white/50 text-xs mt-2">
                                            Submitted: {new Date(userTask.submittedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Task Modal */}
            {showModal && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl bg-[#193320] border border-[#32673f] rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 md:p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-white text-2xl font-bold mb-2">Submit Task</h2>
                                    <h3 className="text-primary text-lg font-semibold">{selectedTask.title}</h3>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-3xl">close</span>
                                </button>
                            </div>

                            <p className="text-white/70 text-sm mb-6">{selectedTask.description}</p>

                            {selectedTask.link && (
                                <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                    <a
                                        href={selectedTask.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-medium inline-flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">open_in_new</span>
                                        Open Task Link
                                    </a>
                                </div>
                            )}

                            {error && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-4 bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmitTask}>
                                <div className="mb-4">
                                    <label className="text-white text-sm font-medium mb-2 block">
                                        Proof of Completion *
                                    </label>
                                    <textarea
                                        value={proof}
                                        onChange={(e) => setProof(e.target.value)}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                        placeholder="Provide link or description of task completion..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="text-white text-sm font-medium mb-2 block">
                                        Upload Proof (Image/Video - Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        className="w-full rounded-lg border border-[#32673f] bg-[#102215] px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-[#112215] hover:file:bg-primary/90"
                                    />
                                    {selectedFile && (
                                        <p className="text-white/60 text-sm mt-2">
                                            Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 rounded-lg border border-[#32673f] px-4 py-3 text-white font-bold hover:bg-[#102215] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || uploading}
                                        className="flex-1 rounded-lg bg-primary px-4 py-3 text-[#112215] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : uploading ? 'Uploading...' : 'Submit Task'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
