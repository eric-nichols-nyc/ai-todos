import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Delete, Edit } from 'lucide-react';

interface TaskListItemProps {
  id: number;
  task: string;
  priority: 'high' | 'medium' | 'low';
  onUpdate: (id: number, updatedTask: { task?: string; priority?: 'high' | 'medium' | 'low' }) => void;
  onDelete: (id: number) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ id, task, priority, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [editedPriority, setEditedPriority] = useState(priority);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(id, { task: editedTask, priority: editedPriority });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setEditedPriority(priority);
    setIsEditing(false);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <li className="flex items-center justify-between p-2 bg-white rounded shadow">
      {isEditing ? (
        <>
          <Input
            value={editedTask}
            onChange={(e) => setEditedTask(e.target.value)}
            className="flex-grow mr-2"
          />
          <Select value={editedPriority} onValueChange={(value: 'high' | 'medium' | 'low') => setEditedPriority(value)}>
            <SelectTrigger className="w-[100px] mr-2">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="mr-2">Save</Button>
          <Button onClick={handleCancel} variant="outline">Cancel</Button>
        </>
      ) : (
        <>
          <span className="flex-grow text-sm">{task}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold mr-2 ${priorityColors[priority]}`}>
            {priority}
          </span>
          <Button onClick={handleEdit} size="sm" variant="outline" className="mr-2">
            <Edit size={16} />
          </Button>
          <Button onClick={() => onDelete(id)} size="sm" variant="destructive">
            <Delete size={16} />
          </Button>
        </>
      )}
    </li>
  );
};

export default TaskListItem;