import Head from 'next/head';
import { Hero } from '../home/hero';
import Features from '../home/features';
import NavBar from '../home/navbar';
import TemplatesSection from '../home/templates-section';
import ClosingCTA from '../home/closing-cta';
import Footer from '../home/footer';

const Home = () => {
  return (
    <>
      <Head>
        <title>Resume Builder — AI-powered, free, no signup</title>
        <meta
          name="description"
          content="Build a professional resume in minutes with AI-assisted writing, professional templates, and one-click PDF export. Free, open source, no account needed."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      <main>
        <Hero />
        <Features />
        <TemplatesSection />
        <ClosingCTA />
      </main>
      <Footer />
    </>
  );
};

export default Home;
