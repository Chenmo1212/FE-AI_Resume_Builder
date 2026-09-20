import Link from 'next/link';
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
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15, 17, 23, 0.08);
  }
`;

const TemplatePreview = styled.div`
  height: 80px;
  background: var(--bg);
  border-radius: 6px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
  gap: 5px;
  overflow: hidden;
`;

const PreviewNameBar = styled.div`
  height: 6px;
  background: ${(p) => p.color || 'var(--ink)'};
  border-radius: 3px;
  width: 55%;
`;

const PreviewLineBar = styled.div`
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  width: ${(p) => p.width || '80%'};
`;

const TemplateName = styled.h3`
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.01em;
`;

const TemplateDesc = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--muted);
  margin: 0;
  flex: 1;
`;

const UseLink = styled.a`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: gap 0.15s ease;

  &:hover {
    gap: 8px;
  }
`;

const templates = [
  {
    name: 'Classic',
    desc: 'Clean two-column layout. Works for any industry, any level.',
    accentColor: '#0F1117',
  },
  {
    name: 'Professional',
    desc: 'Modern single-column with bold section headers. ATS-friendly.',
    accentColor: '#2563EB',
  },
  {
    name: 'Graduate',
    desc: 'Highlights education and projects — ideal for recent grads.',
    accentColor: '#7C3AED',
  },
  {
    name: 'Modern',
    desc: 'Sidebar layout with skills and contact info grouped neatly.',
    accentColor: '#059669',
  },
];

const TemplatesSection = () => {
  return (
    <Section id="templates">
      <SectionLabel>Pick your starting point</SectionLabel>
      <SectionTitle>Professional templates, ready to fill</SectionTitle>
      <Grid>
        {templates.map((t) => (
          <Card key={t.name}>
            <TemplatePreview aria-hidden="true">
              <PreviewNameBar color={t.accentColor} />
              <PreviewLineBar width="35%" />
              <PreviewLineBar width="80%" />
              <PreviewLineBar width="65%" />
              <PreviewLineBar width="45%" />
            </TemplatePreview>
            <TemplateName>{t.name}</TemplateName>
            <TemplateDesc>{t.desc}</TemplateDesc>
            <Link href="/editor" passHref>
              <UseLink>Use this template →</UseLink>
            </Link>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

export default TemplatesSection;
