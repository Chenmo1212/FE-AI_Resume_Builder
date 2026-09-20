import styled from 'styled-components';

const Section = styled.section`
  padding: 80px 5%;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionLabel = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  text-align: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--ink);
  text-align: center;
  margin: 0 0 56px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 28px 24px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15, 17, 23, 0.08);
  }
`;

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  background: var(--accent-dim);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--accent);
`;

const CardTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 10px;
  letter-spacing: -0.01em;
`;

const CardDesc = styled.p`
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--muted);
  margin: 0;
`;

/* ── Inline SVG icons ── */
const IconNoSignup = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

const IconAI = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
    <circle cx="9" cy="14" r="1" />
    <circle cx="15" cy="14" r="1" />
  </svg>
);

const IconTimer = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconExport = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="12" y2="18" />
    <line x1="15" y1="15" x2="12" y2="18" />
  </svg>
);

const features = [
  {
    icon: <IconNoSignup />,
    title: 'No signup required',
    desc: 'Completely free and open source. No registration, no tracking. Your information never touches our servers.',
  },
  {
    icon: <IconAI />,
    title: 'AI-assisted writing',
    desc: 'Describe your role and let AI generate tailored bullet points. Fine-tune with Prompt Studio until every word earns its place.',
  },
  {
    icon: <IconTimer />,
    title: 'Build in minutes',
    desc: 'A powerful editor with professional templates gets you from blank page to polished resume in a matter of clicks.',
  },
  {
    icon: <IconExport />,
    title: 'Export-ready PDF',
    desc: 'One-click print to a perfectly formatted A4 PDF, ready to attach to your next application.',
  },
];

const Features = () => {
  return (
    <Section id="features">
      <SectionLabel>Why Resume Builder</SectionLabel>
      <SectionTitle>Everything you need, nothing you don&apos;t</SectionTitle>
      <Grid>
        {features.map((f) => (
          <Card key={f.title}>
            <IconBox>{f.icon}</IconBox>
            <CardTitle>{f.title}</CardTitle>
            <CardDesc>{f.desc}</CardDesc>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default Features;
