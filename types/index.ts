export type Task = {
    id: number;
    task: string;
    priority: 'high' | 'medium' | 'low';
    due_date: string | null;
    created_at: string;
    updated_at?: string;
    completed: boolean;
};