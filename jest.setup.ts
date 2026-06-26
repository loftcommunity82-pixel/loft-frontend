jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
  emailTemplates: {
    newMessage: jest.fn(() => ({ to: '', subject: '', html: '' })),
    applicationSubmitted: jest.fn(() => ({ to: '', subject: '', html: '' })),
    statusUpdate: jest.fn(() => ({ to: '', subject: '', html: '' })),
    newApplicant: jest.fn(() => ({ to: '', subject: '', html: '' })),
  },
  shouldSendEmail: jest.fn(),
}))
