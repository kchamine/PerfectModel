'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Camera, User } from 'lucide-react'

export default function ProfileSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      setUserId(session.user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUsername(profile.username ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? null)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSavingProfile(true)
    setProfileMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), bio: bio.trim() || null })
      .eq('id', userId)

    setSavingProfile(false)
    if (error) {
      setProfileMsg({ type: 'error', text: error.message })
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated.' })
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    setSavingPassword(true)
    setPasswordMsg(null)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setSavingPassword(false)
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadAvatar(e: React.FormEvent) {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file || !userId) return
    setSavingAvatar(true)
    setAvatarMsg(null)

    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setSavingAvatar(false)
      setAvatarMsg({ type: 'error', text: uploadError.message })
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    setSavingAvatar(false)
    if (updateError) {
      setAvatarMsg({ type: 'error', text: updateError.message })
    } else {
      setAvatarUrl(publicUrl)
      setAvatarPreview(null)
      setAvatarMsg({ type: 'success', text: 'Profile picture updated.' })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link href="/profile" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={14} />
        Back to profile
      </Link>

      <h1 className="text-2xl font-bold text-white mb-8">Profile Settings</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Picture</h2>
        <form onSubmit={uploadAvatar} className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full bg-brand-800 flex items-center justify-center shrink-0 overflow-hidden group cursor-pointer"
          >
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-brand-200" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </button>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <p className="text-sm text-slate-400 mb-3">Click the avatar to choose an image (JPG, PNG, GIF, WebP).</p>
            {avatarPreview && (
              <button type="submit" disabled={savingAvatar} className="btn-primary text-sm">
                {savingAvatar ? 'Uploading…' : 'Save picture'}
              </button>
            )}
            {avatarMsg && (
              <p className={`text-sm mt-2 ${avatarMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {avatarMsg.text}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Profile info */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile Info</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Username</label>
            <input
              className="input w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_\-]+"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Bio</label>
            <textarea
              className="input w-full resize-none"
              rows={3}
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the community about yourself…"
            />
          </div>
          {profileMsg && (
            <p className={`text-sm ${profileMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">New password</label>
            <input
              type="password"
              className="input w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirm new password</label>
            <input
              type="password"
              className="input w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {passwordMsg.text}
            </p>
          )}
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
