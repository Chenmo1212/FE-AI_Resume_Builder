import Link from 'next/link';
import styled, { keyframes } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
`;

const typing = keyframes`
  from { width: 0; }
  to   { width: 100%; }
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  padding: 64px 5% 80px;
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 64px;
  }
`;

const HeroContent = styled.div`
  flex: 1;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeUp} 0.5s ease both;
  }
`;

const Eyebrow = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
`;

const Headline = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  color: var(--ink);
  margin: 0 0 20px;

  span {
    color: var(--accent);
  }
`;

const SubText = styled.p`
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.7;
  color: var(--muted);
  margin-bottom: 36px;
  max-width: 420px;
`;

const CTARow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PrimaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.75rem;
  background: var(--accent);
  color: #fff;
  border-radius: 6px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
`;

const SecondaryCTA = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.75rem;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  &:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
`;

/* ── Resume Preview Card ───────────────────────────── */

const PreviewWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${fadeUp} 0.5s 0.15s ease both;
  }
`;

const ResumeCard = styled.div`
  width: 100%;
  max-width: 340px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(15, 17, 23, 0.08);
  padding: 28px 24px;
  font-family: var(--font-body);
`;

const CardName = styled.div`
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.02em;
  margin-bottom: 4px;
`;

const CardTitle = styled.div`
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 16px;
`;

const CardDivider = styled.div`
  height: 1px;
  background: var(--border);
  margin-bottom: 16px;
`;

const CardSection = styled.div`
  margin-bottom: 14px;
`;

const CardLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
`;

const CardLine = styled.div`
  height: 8px;
  background: var(--bg);
  border-radius: 4px;
  margin-bottom: 5px;
  width: ${(p) => p.width || '100%'};
`;

const TypingLine = styled.div`
  height: 8px;
  background: var(--accent-dim);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  width: 75%;

  &::after {
    content: '';
    display: block;
    height: 100%;
    background: var(--accent);
    border-radius: 4px;

    @media (prefers-reduced-motion: no-preference) {
      animation: ${typing} 2s steps(24, end) infinite alternate;
    }

    @media (prefers-reduced-motion: reduce) {
      width: 60%;
    }
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 12px;
  background: var(--accent);
  vertical-align: middle;
  margin-left: 4px;
  border-radius: 1px;

  @media (prefers-reduced-motion: no-preference) {
    animation: ${blink} 1s step-end infinite;
  }
`;

const AiBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 3px 8px;
  border-radius: 20px;
  margin-top: 8px;
`;

export const Hero = () => {
  return (
    <HeroSection>
      <HeroContent>
        <Eyebrow>AI-powered · Free · No signup</Eyebrow>
        <Headline>
          Build your resume,<br />
          let <span>AI</span> fill the blanks.
        </Headline>
        <SubText>
          Describe your experience, choose a template, and export a print-ready PDF — all in your browser. Your data never leaves your device.
        </SubText>
        <CTARow>
          <Link href="/editor" passHref>
            <PrimaryCTA>
              Build my resume →
            </PrimaryCTA>
          </Link>
          <SecondaryCTA href="#templates">View templates</SecondaryCTA>
        </CTARow>
      </HeroContent>

      <PreviewWrapper aria-hidden="true">
        <ResumeCard>
          <CardName>Alex Johnson</CardName>
          <CardTitle>Senior Software Engineer</CardTitle>
          <CardDivider />
          <CardSection>
            <CardLabel>Summary</CardLabel>
            <TypingLine />
            <Cursor />
            <AiBadge>✦ AI is writing…</AiBadge>
          </CardSection>
          <CardSection>
            <CardLabel>Experience</CardLabel>
            <CardLine width="90%" />
            <CardLine width="75%" />
            <CardLine width="60%" />
          </CardSection>
          <CardSection>
            <CardLabel>Skills</CardLabel>
            <CardLine width="50%" />
            <CardLine width="65%" />
          </CardSection>
        </ResumeCard>
      </PreviewWrapper>
    </HeroSection>
  );
};
