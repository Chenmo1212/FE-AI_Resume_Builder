import Link from 'next/link';
import styled from 'styled-components';

const Section = styled.section`
  background: var(--accent-dark);
  padding: 80px 5%;
  text-align: center;
`;

const Inner = styled.div`
  max-width: 560px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0 0 16px;
`;

const Sub = styled.p`
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 36px;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.875rem 2rem;
  background: #fff;
  color: var(--accent-dark);
  border-radius: 6px;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--accent-dim);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid #fff;
    outline-offset: 3px;
  }
`;

const Footnote = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 20px 0 0;
`;

const ClosingCTA = () => {
  return (
    <Section>
      <Inner>
        <Title>Your next job starts with your resume.</Title>
        <Sub>
          No templates to buy, no account to create. Open the editor and start building in seconds.
        </Sub>
        <Link href="/editor" passHref>
          <CTAButton>Start building — it&apos;s free</CTAButton>
        </Link>
        <Footnote>No account needed · Data stays in your browser</Footnote>
      </Inner>
    </Section>
  );
};

export default ClosingCTA;
