
import React, { useState, useEffect } from 'react'
import { GraduationCap, Award, FileText, Code2, Edit3, ExternalLink } from 'lucide-react'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { studentService } from '../../services/studentService'
import { useToast } from '../../hooks/useToast'

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    resume_url: '',
    skills: '',
  })

  const { error: toastError, success: toastSuccess } = useToast()

  const load = async () => {
    try {
      setLoading(true)
      const data = await studentService.getMyProfile()
      setProfile(data)
      setFormData({
        first_name: data?.first_name || '',
        last_name: data?.last_name || '',
        phone: data?.phone || '',
        resume_url: data?.resume_url || '',
        skills: Array.isArray(data?.skills) ? data.skills.join(', ') : '',
      })
    } catch (error) {
      toastError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        resume_url: formData.resume_url || null,
        skills: skillsArray,
      }

      await studentService.updateMyProfile(payload)
      toastSuccess('Profile updated successfully!')
      setEditModalOpen(false)
      await load()
    } catch (err) {
      toastError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !profile) {
    return <LoadingSpinner message="Loading academic portfolio..." />
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Candidate Academic Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified academic metrics, institutional records, and readiness benchmarks.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          iconLeft={Edit3}
          onClick={() => setEditModalOpen(true)}
        >
          Edit Profile
        </Button>
      </div>

      <Card
        title="Student Identification & Contact"
        subtitle="Institutional registration and verification details"
        icon={GraduationCap}
      >
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Full Name</span>
            <span className="font-bold text-slate-900 text-sm">
              {profile?.first_name} {profile?.last_name}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">University Roll Number</span>
            <span className="font-mono font-bold text-indigo-700 text-sm">
              {profile?.roll_number}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Department</span>
            <span className="font-semibold text-slate-800">
              {profile?.department?.name || 'Computer Science & Engineering'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Graduation Class</span>
            <span className="font-semibold text-slate-800">
              Batch of {profile?.batch_year || 2026}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Contact Phone</span>
            <span className="font-semibold text-slate-800">
              {profile?.phone || 'Not provided'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Registered Email</span>
            <span className="font-semibold text-slate-800">
              {profile?.user?.email || 'N/A'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <span className="text-slate-400 block mb-0.5">Resume / Portfolio Link</span>
            {profile?.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800"
              >
                <FileText className="w-3.5 h-3.5" />
                View Resume
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-400">No resume URL linked yet</span>
            )}
          </div>
        </div>
      </Card>

      <Card
        title="Technical Skills & Proficiencies"
        subtitle="Used for drive matching and recruiter search"
        icon={Code2}
      >
        <div className="flex flex-wrap gap-2">
          {Array.isArray(profile?.skills) && profile.skills.length > 0 ? (
            profile.skills.map((skill, idx) => (
              <Badge key={idx} variant="info">
                {skill}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-slate-400">No technical skills added yet. Click Edit Profile to add skills.</p>
          )}
        </div>
      </Card>

      <Card
        title="Academic Performance & Eligibility Records"
        subtitle="Used by automated rule engine for placement drive filtering"
        icon={Award}
      >
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
            <span className="text-slate-500 block mb-1">Cumulative CGPA</span>
            <span className="text-2xl font-black text-indigo-700 font-mono">
              {profile?.cgpa || '8.50'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Scale of 10.0</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
            <span className="text-slate-500 block mb-1">Active Backlogs</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              {profile?.active_backlogs ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              {profile?.active_backlogs === 0 ? 'Clear Record' : 'Pending Backlog'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
            <span className="text-slate-500 block mb-1">Placement Status</span>
            <span className="text-lg font-black text-purple-700 uppercase">
              {profile?.is_placed ? 'Placed' : 'In Process'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              University Verified
            </span>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Profile"
        subtitle="Update your personal details, technical skills, and resume link"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <Input
            label="Contact Phone"
            type="tel"
            placeholder="+91 9876543210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Resume / Portfolio URL"
            type="url"
            placeholder="https://drive.google.com/..."
            value={formData.resume_url}
            onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
          />

          <Input
            label="Technical Skills (comma-separated)"
            placeholder="Python, React, PostgreSQL, Docker"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            helperText="Separate each skill with a comma"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
