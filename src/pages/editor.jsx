import Head from 'next/head';
import { Resume } from '../core/containers/Resume';
import { Sidebar } from '../core/containers/Sidebar';
import { LeftNav } from '../core/containers/LeftNav';
import { FlexHC } from '../styles/styles';

const Editor = () => {
  return (
    <FlexHC>
      <Head>
        <title>Resume Builder</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LeftNav />
      <Resume />
      <Sidebar />
    </FlexHC>
  );
};

export default Editor;
