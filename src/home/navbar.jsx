import Link from 'next/link';
import styled from 'styled-components';
import CustomImage from '../core/utils/imageUtils';

const Nav = styled.nav`
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const NavInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 5%;
  height: 60px;
  font-family: var(--font-body);
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  color: var(--ink);
  letter-spacing: -0.02em;
`;

const RightItems = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const NavLink = styled.a`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--muted);
  transition: color 0.15s ease;
  display: none;

  &:hover {
    color: var(--ink);
  }

  @media (min-width: 768px) {
    display: block;
  }
`;

const NavBar = () => {
  return (
    <Nav>
      <NavInner>
        <Link href="/" passHref>
          <LogoLink>
            <CustomImage src="/logo.png" alt="logo" height="32px" width="32px" />
            Resume Builder
          </LogoLink>
        </Link>
        <RightItems>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#templates">Templates</NavLink>
        </RightItems>
      </NavInner>
    </Nav>
  );
};

export default NavBar;
