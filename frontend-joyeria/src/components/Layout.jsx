import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../utils/brand'
import Navbar from './Navbar'
import Footer from './Footer'
import './Layout.css'

export default function SiteLayout({ children, fullWidth = false }) {
  return (
    <div className="site-layout">
      <Navbar />
      <main className={fullWidth ? 'site-main--full' : 'site-main'}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <SiteLayout>
      <div className="auth-section">
        <div className="auth-card card-brand">
          <div className="auth-card-header text-center">
            <p className="label-caps mb-2">{BRAND_NAME}</p>
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          </div>
          <div className="auth-card-body">{children}</div>
        </div>
      </div>
    </SiteLayout>
  )
}

export function AuthFooterLink({ text, linkText, to }) {
  return (
    <p className="auth-footer-link">
      {text}{' '}
      <Link to={to}>{linkText}</Link>
    </p>
  )
}

export function DashboardLayout({ title, subtitle, children }) {
  return (
    <SiteLayout>
      <div className="dashboard-section">
        <div className="dashboard-header">
          <p className="label-caps mb-2">Panel</p>
          <h1 className="dashboard-title">{title}</h1>
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </SiteLayout>
  )
}
