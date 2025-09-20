import styled from 'styled-components';
import Head from 'next/head';
import { Hero } from '../home/hero';
import Features from '../home/features';
import NavBar from '../home/navbar';

const Main = styled.main`
  padding: 10px 5% 0;
  margin: auto;
  max-width: 1200px;

  & > div {
    margin-bottom: 25px;
  }
`;

const Home = () => {
  return (
    <>
      <Head>
        <title>Resume Builder</title>
        <meta name="description" content="Single Page Resume Builder for everyone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <NavBar />
        <Hero />
        <Features />
      </Main>
    </>
  );
};

export default Home;
