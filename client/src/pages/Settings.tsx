import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, User, Camera, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/AuthProvider'
import { useProfile } from '@/lib/api-hooks'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function Settings() {
  const { user } = useAuth()
  const { profile, setProfile, loading, error: fetchError } = useProfile(user?.email)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
    }
  }, [profile])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await api.patch('/users/profile', {
          email: user?.email,
          profileImage: reader.result as string,
        })
        setProfile((p: any) => ({ ...p, profileImage: reader.result }))
        toast.success('Profile picture updated')
      } catch {
        toast.error('Failed to upload image')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleRemoveImage() {
    try {
      await api.patch('/users/profile', {
        email: user?.email,
        profileImage: null,
      })
      setProfile((p: any) => ({ ...p, profileImage: null }))
      toast.success('Profile picture removed')
    } catch {
      toast.error('Failed to remove image')
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/users/profile', {
        email: user?.email,
        firstName,
        lastName,
      })
      setProfile((p: any) => ({ ...p, firstName, lastName }))
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (fetchError) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-neutral-400 mb-4">{fetchError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
    )
  }

  if (loading) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
    )
  }

  return (
      <div className="container px-4 md:px-6 py-16 sm:py-20 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-neutral-400 mb-10">Manage your account settings and preferences</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-4 overflow-hidden">
                    {profile?.profileImage ? (
                      <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-emerald-400" />
                    )}
                  </div>
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <Button variant="outline" size="sm" className="border-white/10" asChild>
                      <span>Upload Photo</span>
                    </Button>
                    <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </Label>
                  {profile?.profileImage && (
                    <Button variant="ghost" size="sm" className="text-red-400 mt-2" onClick={handleRemoveImage}>
                      Remove
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-400">
                  <p>Password: ••••••••</p>
                  <p>2FA: Active</p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-emerald-400" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={user?.email || ''} disabled />
                    </div>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Mail className="h-4 w-4 text-emerald-400" />
                    Email & Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-400">
                    Primary email: <span className="text-white">{user?.email}</span>
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">
                    Email verified
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
  )
}
