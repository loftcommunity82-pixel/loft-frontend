'use client'

import ProfileForm from '@/components/forms/profile-form'
import React, { useState, useEffect } from 'react'
import ProfilePicture from './_components/profile-picture'
import { EmailVerification } from './_components/email-verification'
import { useAuthContext } from '@/providers/auth-provider'
import { Shield, Mail, User, Camera } from 'lucide-react'
import { Loader2 } from 'lucide-react'

const Settings = () => {
  const { user, isAuthenticated } = useAuthContext()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return

    fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile')
        return res.json()
      })
      .then(data => {
        setProfileUser(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isAuthenticated, user?.email])

  const removeProfileImage = async () => {
    if (!user?.email) return null
    const res = await fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileImage: '' }),
    })
    if (res.ok) {
      setProfileUser((prev: any) => ({ ...prev, profileImage: '' }))
    }
    return res.ok ? res.json() : null
  }

  const uploadProfileImage = async (image: string) => {
    if (!user?.email) return null
    const res = await fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileImage: image }),
    })
    if (res.ok) {
      setProfileUser((prev: any) => ({ ...prev, profileImage: image }))
    }
    return res.ok ? res.json() : null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Camera className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">Upload your photo</p>
              </div>
            </div>
            <ProfilePicture
              userImage={profileUser?.profileImage || null}
              onDelete={removeProfileImage}
              onUpload={uploadProfileImage}
            />
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Account Security</h3>
                <p className="text-sm text-muted-foreground">Password & auth</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground/80">Password</span>
                <span className="text-xs text-muted-foreground">••••••••</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <span className="text-sm text-foreground/80">Two-Factor Auth</span>
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <User className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Personal Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>
            </div>
            <ProfileForm user={profileUser} />
          </div>

          <div className="bg-card border rounded-xl p-6 space-y-4 mt-6">
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Mail className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-foreground font-semibold">Email & Notifications</h3>
                <p className="text-sm text-muted-foreground">Manage your email preferences</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">Primary Email</span>
                <span className="text-sm text-muted-foreground">{profileUser?.email || user?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/80">Email Verified</span>
                <EmailVerification
                  email={profileUser?.email || user?.email || ''}
                  isVerified={profileUser?.emailVerified || false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
