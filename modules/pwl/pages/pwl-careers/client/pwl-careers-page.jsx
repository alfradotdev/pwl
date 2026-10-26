'use strict';

import { PageLayout } from '@loopar/page';
import { useEffect, useState } from 'react';
import loopar from 'loopar';
import { Button } from '@cn/components/ui/button';
import { Briefcase, ChevronDown, Clock, DollarSign, Loader2, MapPin } from 'lucide-react';
import { cn } from '@cn/lib/utils';

const money = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? `$${n.toFixed(2).replace(/\.00$/, '')}` : null;
};

const payRange = ({ pay_min, pay_max }) => {
  const [from, to] = [money(pay_min), money(pay_max)];
  if (from && to && from !== to) return `${from} – ${to} / hour`;
  return from || to ? `${from || to} / hour` : null;
};

const scrollToApply = (e) => {
  e.preventDefault();
  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function Meta({ icon: Icon, children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-4 shrink-0 text-primary" />
      {children}
    </span>
  );
}

function OpeningCard({ opening }) {
  const [open, setOpen] = useState(false);
  const pay = payRange(opening);
  const hasDetails = opening.description_html || opening.requirements_html;

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight">{opening.title}</h3>
        {parseInt(opening.openings) > 1 && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {opening.openings} openings
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <Meta icon={MapPin}>{opening.location}</Meta>
        <Meta icon={Briefcase}>{opening.employment_type}</Meta>
        <Meta icon={Clock}>{opening.shifts}</Meta>
        <Meta icon={DollarSign}>{pay}</Meta>
      </div>

      {opening.summary && <p className="text-sm">{opening.summary}</p>}

      {hasDetails && open && (
        <div className="space-y-3 border-t pt-3 text-sm">
          {opening.description_html && (
            <div className="prose prose-sm max-w-none dark:prose-invert [&_.anchor]:hidden" dangerouslySetInnerHTML={{ __html: opening.description_html }} />
          )}
          {opening.requirements_html && (
            <div>
              <p className="mb-1 font-medium">Requirements</p>
              <div className="prose prose-sm max-w-none text-muted-foreground dark:prose-invert [&_.anchor]:hidden" dangerouslySetInnerHTML={{ __html: opening.requirements_html }} />
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Button size="sm" onClick={scrollToApply}>Apply now</Button>
        {hasDetails && (
          <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); setOpen(!open); }}>
            {open ? 'Hide details' : 'Details'}
            <ChevronDown className={cn('ml-1 size-4 transition-transform', open && 'rotate-180')} />
          </Button>
        )}
      </div>
    </article>
  );
}

/** Open, published Staffing Job Openings. Loaded after mount so SSR and hydration match. */
function Openings() {
  const [openings, setOpenings] = useState(null);

  useEffect(() => {
    let alive = true;
    loopar.call('Staffing Job Opening', 'openings', { freeze: false })
      .then((r) => alive && setOpenings(r?.openings || []))
      .catch(() => alive && setOpenings([]));
    return () => { alive = false; };
  }, []);

  if (openings === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!openings.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="font-medium">No open positions right now.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We're always building teams for new sites — send your application and we'll reach out.
        </p>
        <Button className="mt-4" size="sm" onClick={scrollToApply}>Apply anyway</Button>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {openings.map((o) => <OpeningCard key={o.name} opening={o} />)}
    </div>
  );
}

const SLOTS = { openings: Openings };

export default function StaffingCareersPage() {
  return <PageLayout slots={SLOTS} />;
}
