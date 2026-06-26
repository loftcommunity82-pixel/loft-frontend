import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, User, Briefcase, FileText, Bell, MessageSquare,
  ArrowRight, Building2, Users, Settings, LayoutDashboard,
  PenSquare, Shield, Star,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const jobSeekerSections = [
  {
    value: 'profile', icon: User, title: 'Complete Your Profile',
    subtitle: 'Set up your personal information and stand out to employers',
    steps: [
      { action: 'Upload a profile picture', detail: 'Go to Settings → Profile Picture. Upload a professional photo — profiles with photos get 7x more views.', link: '/settings', linkLabel: 'Go to Settings' },
      { action: 'Fill in your personal details', detail: 'Add your full name, location, and a professional summary. A complete profile is 3x more likely to be contacted.', link: '/settings', linkLabel: 'Update Profile' },
      { action: 'Add your skills', detail: 'List relevant skills that match your target roles. Recruiters search by skills, so be thorough.', link: '/profile', linkLabel: 'Manage Skills' },
      { action: 'Upload your resume', detail: 'Go to Profile → Resume tab to upload your CV. Keep it updated with your latest experience.', link: '/profile', linkLabel: 'Upload Resume' },
      { action: 'Verify your email', detail: 'Check your Settings page for email verification status. A verified email unlocks all platform features.', link: '/settings', linkLabel: 'Verify Email' },
    ],
  },
  {
    value: 'jobs', icon: Briefcase, title: 'Find & Apply for Jobs',
    subtitle: 'Search through thousands of opportunities and apply with one click',
    steps: [
      { action: 'Browse job listings', detail: 'Visit the Jobs page to see all available positions. Use the search bar to find specific roles or companies.', link: '/jobs', linkLabel: 'Browse Jobs' },
      { action: 'Filter by your preferences', detail: 'Use filters for job type (Full-time, Part-time, Contract), experience level, work mode (Remote, On-site, Hybrid), and salary range.', link: '/jobs', linkLabel: 'Search Jobs' },
      { action: 'View job details', detail: 'Click any job card to see the full description, required skills, benefits, and company information.', link: '/jobs', linkLabel: 'View Jobs' },
      { action: 'Save jobs for later', detail: 'Click the bookmark icon on any job listing to save it. Access saved jobs from your Dashboard.', link: '/dashboard', linkLabel: 'Go to Dashboard' },
      { action: 'Apply for a position', detail: 'Click "Apply" on any job, upload your resume, and write a cover letter. Track your application status in the Applications page.', link: '/applications', linkLabel: 'View Applications' },
    ],
  },
  {
    value: 'applications', icon: FileText, title: 'Track Your Applications',
    subtitle: 'Monitor every application from submission to offer',
    steps: [
      { action: 'View all submitted applications', detail: 'The Applications page shows every job you have applied for with current status labels.', link: '/applications', linkLabel: 'My Applications' },
      { action: 'Understand application statuses', detail: 'Status badges tell you where you stand: Pending, Reviewing, Shortlisted, Interview, Offered, or Rejected.', link: '/applications', linkLabel: 'Check Status' },
      { action: 'Prepare for interviews', detail: 'If shortlisted, you will see interview details in the application timeline. Prepare your portfolio and research the company.', link: '/applications', linkLabel: 'Review Applications' },
      { action: 'Respond to offers', detail: 'When you receive an offer, respond promptly. Employers appreciate timely communication.', link: '/messages', linkLabel: 'Open Messages' },
    ],
  },
  {
    value: 'notifications', icon: Bell, title: 'Set Up Notifications',
    subtitle: 'Stay informed about application updates and new opportunities',
    steps: [
      { action: 'Configure notification preferences', detail: 'Go to Notifications to choose which updates you receive — application status changes, new job matches, and messages.', link: '/notifications', linkLabel: 'Notification Settings' },
      { action: 'Enable email notifications', detail: 'Get email alerts for important updates like interview invitations and offer letters.', link: '/notifications', linkLabel: 'Manage Alerts' },
      { action: 'Check the notification bell', detail: 'The bell icon in the top bar shows real-time updates. A red badge indicates unread notifications.', link: '/notifications', linkLabel: 'View Notifications' },
    ],
  },
  {
    value: 'messages', icon: MessageSquare, title: 'Communicate with Employers',
    subtitle: 'Direct messaging keeps all your conversations in one place',
    steps: [
      { action: 'Access your messages', detail: 'The Messages page centralizes all communication with employers and recruiters.', link: '/messages', linkLabel: 'Open Messages' },
      { action: 'Respond promptly', detail: 'Employers appreciate quick replies. Aim to respond within 24 hours during business days.', link: '/messages', linkLabel: 'Check Inbox' },
      { action: 'Keep communication professional', detail: 'Use clear subject lines, address the recipient by name, and proofread before sending.', link: '/messages', linkLabel: 'Send Message' },
    ],
  },
  {
    value: 'dashboard', icon: LayoutDashboard, title: 'Use Your Dashboard',
    subtitle: 'Your command center for job seeking activity',
    steps: [
      { action: 'Review your stats', detail: 'The Dashboard shows your application count, interview count, and profile completion score at a glance.', link: '/dashboard', linkLabel: 'View Dashboard' },
      { action: 'Check saved jobs', detail: 'Access bookmarked positions directly from your Dashboard for quick re-application.', link: '/dashboard', linkLabel: 'Saved Jobs' },
      { action: 'Discover recommended jobs', detail: 'The Dashboard suggests roles based on your profile and search history.', link: '/jobs', linkLabel: 'Browse Recommendations' },
    ],
  },
]

const employerSections = [
  {
    value: 'company', icon: Building2, title: 'Set Up Your Company Profile',
    subtitle: 'Create a compelling company page to attract top talent',
    steps: [
      { action: 'Add company details', detail: 'Go to Company to add your company name, description, industry, location, and website.', link: '/employer/company', linkLabel: 'Edit Company' },
      { action: 'Upload company logo', detail: 'A professional logo builds trust with candidates. Recommended size: 512x512px.', link: '/employer/company', linkLabel: 'Upload Logo' },
      { action: 'Write a compelling description', detail: 'Highlight your company mission, culture, and what makes you a great place to work.', link: '/employer/company', linkLabel: 'Update Description' },
    ],
  },
  {
    value: 'post-jobs', icon: PenSquare, title: 'Post & Manage Jobs',
    subtitle: 'Create detailed job listings that attract the right candidates',
    steps: [
      { action: 'Create a new job posting', detail: 'Go to Jobs → Create Job. Fill in title, description, requirements, salary range, and work mode.', link: '/jobs/create', linkLabel: 'Post a Job' },
      { action: 'Set application requirements', detail: 'Specify required skills, experience level, and whether a resume is mandatory for applicants.', link: '/jobs/create', linkLabel: 'Configure Requirements' },
      { action: 'Review and publish', detail: 'Preview your listing before publishing. You can save as draft and come back later.', link: '/employer/dashboard', linkLabel: 'Manage Jobs' },
    ],
  },
  {
    value: 'candidates', icon: Users, title: 'Review & Hire Candidates',
    subtitle: 'Use the hiring workflow to efficiently evaluate applicants',
    steps: [
      { action: 'View incoming applications', detail: 'The Hiring Workflow page shows all candidates organized by pipeline stage.', link: '/hiring-workflow', linkLabel: 'Open Pipeline' },
      { action: 'Screen applications', detail: 'Review each application, check resumes and cover letters. Move candidates forward or pass as needed.', link: '/hiring-workflow', linkLabel: 'Review Candidates' },
      { action: 'Schedule interviews', detail: 'Use the pipeline to advance candidates to interview stages. Coordinate scheduling through messages.', link: '/hiring-workflow', linkLabel: 'Manage Pipeline' },
      { action: 'Make offers', detail: 'When you find the right candidate, move them to the Offer stage and initiate the offer process.', link: '/hiring-workflow', linkLabel: 'Send Offer' },
    ],
  },
  {
    value: 'employer-dashboard', icon: LayoutDashboard, title: 'Track Hiring Metrics',
    subtitle: 'Monitor your recruitment performance from the employer dashboard',
    steps: [
      { action: 'Review job performance', detail: 'View metrics like total applicants, interview conversion rates, and time-to-hire for each position.', link: '/employer/dashboard', linkLabel: 'View Dashboard' },
      { action: 'Manage active listings', detail: 'See all your open positions, draft listings, and closed roles in one place.', link: '/employer/dashboard', linkLabel: 'Manage Listings' },
      { action: 'Access company analytics', detail: 'Track how many views your company profile and job listings receive.', link: '/employer/dashboard', linkLabel: 'View Analytics' },
    ],
  },
  {
    value: 'employer-settings', icon: Settings, title: 'Manage Account Settings',
    subtitle: 'Keep your employer account secure and up to date',
    steps: [
      { action: 'Update profile information', detail: 'Go to Settings to update your name, email, and notification preferences.', link: '/settings', linkLabel: 'Go to Settings' },
      { action: 'Verify your email', detail: 'A verified email is required to post jobs and communicate with candidates.', link: '/settings', linkLabel: 'Verify Email' },
      { action: 'Manage notifications', detail: 'Choose which updates to receive — new applications, candidate messages, and system notifications.', link: '/notifications', linkLabel: 'Notification Settings' },
    ],
  },
  {
    value: 'employer-messages', icon: MessageSquare, title: 'Communicate with Candidates',
    subtitle: 'Direct messaging keeps all candidate conversations organized',
    steps: [
      { action: 'Message candidates directly', detail: 'Reach out to promising candidates through the Messages page to schedule interviews or ask questions.', link: '/messages', linkLabel: 'Open Messages' },
      { action: 'Respond to applicant inquiries', detail: 'Candidates may reach out with questions about roles. Prompt responses improve candidate experience.', link: '/messages', linkLabel: 'Check Inbox' },
    ],
  },
]

function GuideSection({ section }: { section: typeof jobSeekerSections[0] }) {
  const Icon = section.icon
  return (
    <Card className="bg-card border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10"><Icon className="h-5 w-5 text-emerald-400" /></div>
          <div>
            <CardTitle className="text-foreground">{section.title}</CardTitle>
            <CardDescription className="text-muted-foreground">{section.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="steps">
            <AccordionTrigger className="text-sm text-emerald-400 hover:text-emerald-300">{section.steps.length} steps to complete</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {section.steps.map((step, stepIndex) => (
                  <div key={stepIndex} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-400">{stepIndex + 1}</span>
                      </div>
                      {stepIndex < section.steps.length - 1 && <div className="w-px flex-1 bg-emerald-500/20 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                        </div>
                        <Link to={step.link} className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap mt-1 flex-shrink-0">
                          {step.linkLabel} <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default function Guide() {
  const [activeTab, setActiveTab] = useState('job-seeker')
  const sections = activeTab === 'job-seeker' ? jobSeekerSections : employerSections
  const totalSteps = sections.reduce((sum, s) => sum + s.steps.length, 0)

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10"><BookOpen className="h-6 w-6 text-emerald-400" /></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Guide</h1>
            <p className="text-muted-foreground mt-1">Learn how to use every feature of the platform</p>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 sm:p-6 mb-8 mt-6">
          <div className="flex items-center gap-3 mb-3">
            <Star className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-foreground">Your Progress</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">Follow the steps below to get the most out of the platform. Each section has actionable items to complete.</p>
          <div className="flex items-center gap-4">
            <div className="flex-1"><Progress value={0} className="h-2" /></div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">0 / {totalSteps} steps</span>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border w-full flex-nowrap overflow-x-auto">
            <TabsTrigger value="job-seeker" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" /> Job Seeker
            </TabsTrigger>
            <TabsTrigger value="employer" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Building2 className="h-4 w-4 mr-2" /> Employer
            </TabsTrigger>
          </TabsList>
          <TabsContent value="job-seeker" className="space-y-6">
            {jobSeekerSections.map((section) => (<GuideSection key={section.value} section={section} />))}
          </TabsContent>
          <TabsContent value="employer" className="space-y-6">
            {employerSections.map((section) => (<GuideSection key={section.value} section={section} />))}
          </TabsContent>
        </Tabs>
        <Card className="bg-card border mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground"><Shield className="h-5 w-5 text-emerald-400" /> Need Help?</CardTitle>
            <CardDescription className="text-muted-foreground">If you are stuck or have questions, we are here to help</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link to="/messages"><Button variant="default" className="bg-emerald-600 hover:bg-emerald-700"><MessageSquare className="h-4 w-4 mr-2" /> Contact Support</Button></Link>
            <Link to="/settings"><Button variant="outline" className="border"><Settings className="h-4 w-4 mr-2" /> Account Settings</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
