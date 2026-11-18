'use strict';

import { PageLayout } from '@loopar/page';
import { useEffect, useState } from 'react';
import loopar from 'loopar';
import { Button } from '@cn/components/ui/button';
import { Loader2, Printer } from 'lucide-react';

/*
 * Corporate capability statement: a one-page Letter sheet the visitor saves
 * as PDF from the browser's print dialog. The services and the company's
 * contact details are read live (controller `statement` action), so the
 * sheet follows the website; the rest is the approved copy below.
 * Paper uses fixed brand colors: it looks the same in dark mode and on print.
 */

const GREEN = '#164A36';
const DARK = '#0b1f17';
const SAGE = '#A8BDA7';
const PAPER = '#F4F5F1';
const INK = '#1f2a25';
const MUTED = '#55625b';

const OVERVIEW = [
  'Primstone Workforce Logistics LLC is a Georgia-based workforce and operational solutions company serving businesses across multiple industries.',
  'We provide flexible staffing and managed teams to help clients maintain workforce coverage, coordinate daily work, and gain clearer performance visibility.',
];

const MODELS = [
  ['Workforce Staffing Solutions', 'Flexible personnel to strengthen your team and maintain coverage while you direct and supervise day-to-day work.'],
  ['Managed Workforce & Operational Solutions', 'Dedicated operational teams coordinated and supervised by Primstone, with scheduling, daily management, and performance reporting.'],
];

const APPROACH = [
  ['Assess & Design', 'Understand your needs and recommend the right staffing or managed-service solution.'],
  ['Mobilize & Prepare', 'Organize people, prepare teams, and coordinate the launch.'],
  ['Manage & Execute', 'Provide staffing support or oversee managed teams and daily operations.'],
  ['Measure & Improve', 'Stay connected, review performance, and identify improvements.'],
];

const INDUSTRIES = [
  'Fleet & Automotive Operations',
  'Transportation & Logistics',
  'Aviation-Related Operations',
  'Hospitality & Customer Service',
  'Retail Operations',
  'Facilities & Site Services',
];

const LEADERS = [
  { name: 'Mercedes Grullón', title: 'Co-Founder & Chief Executive Officer', phone: '(978) 601-8880' },
  { name: 'Haile Hernandez', title: 'Co-Founder & President', phone: '(774) 339-1498' },
];

/*
 * `.pwl-cap-*` sizes the paper; on print the site chrome is already hidden
 * (data-print-hide) and the page has no margins, so the header band bleeds.
 */
const SHEET_CSS = `
@page { size: letter portrait; margin: 0; }
.pwl-cap-stage { overflow-x: auto; padding: 1.5rem 1rem 3rem; }
.lp-print-sheet.pwl-cap-sheet {
  width: 8.5in; min-width: 8.5in; min-height: 11in; padding: 0; margin: 0 auto;
  display: flex; flex-direction: column; overflow: hidden;
  color: ${INK}; font-size: 9.6pt; line-height: 1.42;
}
.pwl-cap-sheet p { margin: 0; color: ${INK}; font-size: inherit; }
.pwl-cap-sheet h2 {
  margin: 0 0 5pt; padding-bottom: 3pt; border-bottom: 1.5pt solid ${SAGE};
  color: ${GREEN}; font-size: 8.6pt; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase;
}
.pwl-cap-sheet ul { margin: 0; padding: 0; list-style: none; }
.pwl-cap-sheet li { position: relative; padding-left: 11pt; margin-bottom: 2.5pt; }
.pwl-cap-sheet li::before {
  content: ""; position: absolute; left: 0; top: 0.5em; width: 5pt; height: 5pt; background: ${GREEN};
}
@media print {
  .pwl-cap-stage { overflow: visible; padding: 0; }
  /* Pinned to the page box: the sheet fills the paper exactly, whatever
     paddings or widths the site's page containers have. */
  .lp-print-sheet.pwl-cap-sheet {
    position: fixed; inset: 0; margin: 0;
    width: auto; min-width: 0; height: auto; min-height: 0;
  }
}
`;

function Block({ title, children, style }) {
  return (
    <section style={{ breakInside: 'avoid', ...style }}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Contact({ company }) {
  const cityLine = [[company.city, company.state].filter(Boolean).join(', '), company.postal_code].filter(Boolean).join(' ');
  const website = String(company.website || '').replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const lines = [
    ...String(company.address || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean),
    cityLine,
    website,
    company.email,
    company.phone,
  ].filter(Boolean);

  return (
    <div style={{ display: 'grid', gap: '1.5pt' }}>
      <p style={{ fontWeight: 700 }}>{company.legal_name || company.company_name || 'Primstone Workforce Logistics LLC'}</p>
      {lines.map((line) => <p key={line}>{line}</p>)}
      <p style={{ color: MUTED, marginTop: '3pt' }}>Business inquiries: visit the Contact page on our website.</p>
    </div>
  );
}

function Statement() {
  const [data, setData] = useState(null);
  const [generated, setGenerated] = useState('');

  // Loaded after mount so SSR and hydration match (same for the date).
  useEffect(() => {
    let alive = true;
    setGenerated(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    loopar.call('Pwl Capability Statement', 'statement', { freeze: false })
      .then((r) => alive && setData({ services: r?.services || [], company: r?.company || {}, logo: r?.logo || null }))
      .catch(() => alive && setData({ services: [], company: {}, logo: null }));
    return () => { alive = false; };
  }, []);

  const ready = data !== null;
  const { services = [], company = {}, logo = null } = data || {};

  return (
    <div>
      <style>{SHEET_CSS}</style>

      <div className="mx-auto flex max-w-[8.5in] flex-wrap items-center justify-between gap-3 px-4 pt-8" data-print-hide>
        <div>
          <h1 className="text-2xl font-bold">Corporate Capability Statement</h1>
          <p className="text-sm text-muted-foreground">
            Choose “Save as PDF” in the print dialog to download a copy.
          </p>
        </div>
        <Button onClick={() => window.print()} disabled={!ready}>
          <Printer className="mr-2 size-4" /> Save as PDF / Print
        </Button>
      </div>

      <div className="pwl-cap-stage">
        <article className="lp-print-sheet pwl-cap-sheet" data-print-sheet>
          <header style={{ background: `linear-gradient(90deg, ${DARK}, ${GREEN})`, color: '#fff', padding: '0.42in 0.55in 0.36in' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.3in' }}>
              {logo
                ? <img src={logo} alt="Primstone Workforce Logistics" style={{ height: '0.62in', width: 'auto' }} />
                : <div style={{ fontSize: '17pt', fontWeight: 800, letterSpacing: '0.02em' }}>PRIMSTONE WORKFORCE LOGISTICS LLC</div>}
              <div style={{ color: SAGE, fontSize: '8.6pt', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'right' }}>
                Capability Statement
              </div>
            </div>
            <div style={{ marginTop: '0.22in', fontSize: '16pt', fontWeight: 700, lineHeight: 1.15 }}>
              Workforce Solutions. Operational Excellence.
            </div>
            <div style={{ marginTop: '3pt', color: PAPER, fontSize: '10.5pt' }}>
              Integrated Workforce Management &amp; Operational Solutions
            </div>
          </header>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr', minHeight: 0 }}>
            <div style={{ padding: '0.34in 0.36in 0.3in 0.55in', display: 'grid', gap: '0.2in', alignContent: 'start' }}>
              <Block title="Company Overview">
                <div style={{ display: 'grid', gap: '5pt' }}>
                  {OVERVIEW.map((text) => <p key={text}>{text}</p>)}
                </div>
              </Block>

              <Block title="Our Service Models">
                <div style={{ display: 'grid', gap: '7pt' }}>
                  {MODELS.map(([name, text]) => (
                    <div key={name} style={{ borderLeft: `3pt solid ${GREEN}`, paddingLeft: '8pt' }}>
                      <p style={{ fontWeight: 700, color: GREEN }}>{name}</p>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="Our Operating Approach">
                <div style={{ display: 'grid', gap: '6pt' }}>
                  {APPROACH.map(([name, text], i) => (
                    <div key={name} style={{ display: 'grid', gridTemplateColumns: '17pt 1fr', gap: '7pt', alignItems: 'start' }}>
                      <span style={{ width: '17pt', height: '17pt', borderRadius: '50%', background: GREEN, color: '#fff', fontSize: '8.5pt', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {i + 1}
                      </span>
                      <p><strong>{name}</strong> — {text}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Block title="Leadership">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10pt' }}>
                  {LEADERS.map((leader) => (
                    <div key={leader.name}>
                      <p style={{ fontWeight: 700 }}>{leader.name}</p>
                      <p style={{ color: MUTED }}>{leader.title}</p>
                      <p>{leader.phone}</p>
                    </div>
                  ))}
                </div>
              </Block>
            </div>

            <aside style={{ background: PAPER, padding: '0.34in 0.5in 0.3in 0.32in', display: 'grid', gap: '0.2in', alignContent: 'start' }}>
              <Block title="Core Capabilities">
                {ready
                  ? <ul>{services.map((title) => <li key={title}>{title}</li>)}</ul>
                  : <Loader2 className="size-5 animate-spin" style={{ color: MUTED }} />}
              </Block>

              <Block title="Industries We Support">
                <ul>{INDUSTRIES.map((name) => <li key={name}>{name}</li>)}</ul>
              </Block>

              <Block title="Contact">
                <Contact company={company} />
              </Block>
            </aside>
          </div>

          <footer style={{ background: GREEN, color: '#fff', padding: '0.14in 0.55in', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.3in', fontSize: '8.4pt' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Georgia-Based&nbsp;&nbsp;|&nbsp;&nbsp;Woman-Owned&nbsp;&nbsp;|&nbsp;&nbsp;Minority-Owned
            </span>
            <span style={{ color: SAGE }}>{generated}</span>
          </footer>
        </article>
      </div>
    </div>
  );
}

const SLOTS = { statement: () => <Statement /> };

export default function PwlCapabilityStatementPage() {
  return <PageLayout slots={SLOTS} />;
}
