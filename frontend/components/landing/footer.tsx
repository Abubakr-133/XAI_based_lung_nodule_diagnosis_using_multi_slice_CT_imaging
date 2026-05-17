"use client"

import Link from "next/link"
import { Activity, Github, Linkedin, Mail } from "lucide-react"

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Workflow", href: "#workflow" },
  { label: "Performance", href: "#performance" },
  { label: "FAQs", href: "#faq" },
  { label: "Dashboard", href: "/dashboard" },
]

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:contact@example.com", label: "Email" },
]

export function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">LungAI Diagnosis</span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-6">
              An explainable CNN-based lung nodule diagnostic system using deep learning and interpretable AI for medical imaging analysis.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Project Info</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>Research Project</li>
              <li>Deep Learning</li>
              <li>Medical Imaging</li>
              <li>Explainable AI</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <div className="rounded-3xl border border-border/50 bg-card/70 px-5 py-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-foreground">Designed by</p>
            <p className="mt-3 text-sm text-muted-foreground">Shaik Abubakr (2451-22-733-133)</p>
            <p className="text-sm text-muted-foreground">M.Koushik (2451-22-733-151)</p>
            <p className="text-sm text-muted-foreground">M.Prudhvi (2451-22-733-174)</p>
            <a
              href="https://mvsrec.edu.in/index.php?option=com_content&view=article&layout=edit&id=902&Itemid=781"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-sm text-primary underline-offset-4 transition hover:underline"
            >
              Special thanks to Merneni Dyna Ma&apos;am for his valuable support and guidance throughout the development journey.
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
