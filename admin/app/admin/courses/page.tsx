'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AcademicService } from '@/lib/services/academic-service';
import { Course } from '@/lib/types/admin';
import { Plus, RefreshCw } from 'lucide-react';

export default function CoursesAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState('JEE');
  const [formDuration, setFormDuration] = useState('24');
  const [formDesc, setFormDesc] = useState('');

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await AcademicService.getCourses();
      setCourses(data);
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!formName.trim() || !formCode.trim()) return;
    setIsSubmitting(true);
    try {
      await AcademicService.createCourse({
        name: formName.trim(),
        code: formCode.trim(),
        category: formCategory,
        durationMonths: parseInt(formDuration) || 12,
        description: formDesc.trim() || 'Comprehensive academic program with rigorous test series.',
      });
      await fetchCourses();
      setFormName('');
      setFormCode('');
      setFormDesc('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create course:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the course "${name}"?`)) return;
    try {
      await AcademicService.deleteCourse(id);
      await fetchCourses();
    } catch (err: any) {
      alert('Failed to delete course: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Courses Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage academic tracks, curriculum, and batch assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">LIVE DATABASE</Badge>
          <Button size="sm" variant="outline" onClick={fetchCourses} disabled={isLoading} leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Create New Course
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name & Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Batches</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-2 text-indigo-400" />
                  Loading courses from database...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-400">
                  No courses found in database.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-bold text-white">{c.name}</div>
                    <div className="text-xs text-slate-400">{c.code}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-indigo-400">{c.category}</TableCell>
                  <TableCell className="text-xs text-slate-300">{c.durationMonths} Months</TableCell>
                  <TableCell className="text-xs font-black text-indigo-400">{c.batchesCount || 0} Batches</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? 'success' : 'outline'}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.name)}
                      className="px-2.5 py-1 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded border border-rose-500/30 transition-colors"
                    >
                      Delete
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Academic Course">
        <div className="space-y-4">
          <Input label="Course Name" placeholder="e.g. OSSC CGL & Combined Police SI Master Batch" value={formName} onChange={(e) => setFormName(e.target.value)} />
          <Input label="Course Code" placeholder="e.g. OSSC-CGL-1Y" value={formCode} onChange={(e) => setFormCode(e.target.value)} />
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Central Government">Central Government (SSC CGL, CHSL, MTS, GD)</option>
              <option value="State Recruitment">State Recruitment (OSSC, OSSSC, Police Constable/SI)</option>
              <option value="Railways">Railways (RRB NTPC, Group D)</option>
              <option value="Banking">Banking & Finance (IBPS, SBI PO/Clerk)</option>
              <option value="Teaching">Teaching (CT, B.Ed, OTET, OSSTET)</option>
              <option value="Defence">Defence & Uniform Services</option>
            </select>
          </div>
          <Input label="Duration (Months)" type="number" placeholder="12" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} />
          <Input label="Description" placeholder="Course syllabus overview and targets" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateCourse} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
