import styled from 'styled-components';
import { getIcon } from '../styles/icons';

const FooterEl = styled.footer`
  border-top: 1px solid var(--border);
  padding: 28px 5%;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Copy = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--muted);
  margin: 0;
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const FooterLink = styled.a`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--ink);
  }
`;

const GitHubIcon = styled.span`
  font-size: 1.125rem;
  display: flex;
  align-items: center;
`;

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <FooterEl>
      <Inner>
        <Copy>© {year} Resume Builder · MIT License</Copy>
        <Links>
          <FooterLink
            href="https://github.com/sadanandpai/resume-builder"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon>{getIcon('github')}</GitHubIcon>
            View on GitHub
          </FooterLink>
        </Links>
      </Inner>
    </FooterEl>
  );
};

export default Footer;
