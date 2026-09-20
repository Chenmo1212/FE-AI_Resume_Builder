import Link from 'next/link';
import styled from 'styled-components';
import CustomImage from '../core/utils/imageUtils';

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
    grid-template-columns: repeat(5, 1fr);
  }
`;

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15, 17, 23, 0.08);
  }
`;

const PreviewWrapper = styled.div`
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg);
  line-height: 0;
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
    image: '/images/classic.png',
    desc: 'Clean two-column layout. Works for any industry, any level.',
  },
  {
    name: 'Professional',
    image: '/images/professional.png',
    desc: 'Modern single-column with bold section headers. ATS-friendly.',
  },
  {
    name: 'Graduate',
    image: '/images/graduate.png',
    desc: 'Highlights education and projects — ideal for recent grads.',
  },
  {
    name: 'Legacy',
    image: '/images/legacy.png',
    desc: 'Traditional layout with a timeless structure. Great for senior roles.',
  },
  {
    name: 'One Column',
    image: '/images/onecolumn.png',
    desc: 'Minimal single-column format. Clean, readable, distraction-free.',
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
            <PreviewWrapper>
              <CustomImage
                src={t.image}
                alt={`${t.name} resume template preview`}
                width="300px"
                height="420px"
                layout="responsive"
              />
            </PreviewWrapper>
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
