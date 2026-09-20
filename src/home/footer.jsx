import styled from 'styled-components';

const FooterEl = styled.footer`
  border-top: 1px solid var(--border);
  padding: 28px 5%;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
`;

const Copy = styled.p`
  font-family: var(--font-body);
  font-size: 0.8125rem;
  color: var(--muted);
  margin: 0;
`;

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <FooterEl>
      <Inner>
        <Copy>© {year} Resume Builder · MIT License</Copy>
      </Inner>
    </FooterEl>
  );
};

export default Footer;
