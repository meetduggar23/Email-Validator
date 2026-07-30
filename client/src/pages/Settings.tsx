import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Palette, Bell, Download, Globe, User, Trash2, AlertTriangle,
  Moon, Sun, Monitor,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { api } from '@/services/api'

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [exportFormat, setExportFormat] = useState('csv')
  const [apiSource, setApiSource] = useState('public')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.preferences) {
      setNotifications(user.preferences.notifications)
      setExportFormat(user.preferences.exportFormat)
      setApiSource(user.preferences.apiSource)
    }
  }, [user])

  const handleSave = async () => {
    try {
      await api.settings.update({ theme, notifications, exportFormat, apiSource })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await api.settings.deleteAccount()
      logout()
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === opt.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                      : 'border-border hover:border-primary-300'
                  }`}
                >
                  <opt.icon className={`w-6 h-6 ${theme === opt.value ? 'text-primary-500' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${theme === opt.value ? 'text-primary-500' : ''}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about your validations</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Default Export Format</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred export file format</p>
              </div>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">API Source</Label>
                <p className="text-sm text-muted-foreground">Select API provider for validations</p>
              </div>
              <Select value={apiSource} onValueChange={setApiSource}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public APIs</SelectItem>
                  <SelectItem value="internal">Internal Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saved}>
              {saved ? 'Saved!' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-danger-200 dark:border-danger-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger-500"><AlertTriangle className="w-5 h-5" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <div>
                <p className="font-medium text-danger-700 dark:text-danger-300">Delete Account</p>
                <p className="text-sm text-danger-500/70">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
