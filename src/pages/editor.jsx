import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Resume } from '../core/containers/Resume';
import { Sidebar } from '../core/containers/Sidebar';
import { LeftNav } from '../core/containers/LeftNav';
import { FlexHC } from '../styles/styles';
import { useTemplates, templates } from '../stores/templates.store';

const Editor = () => {
  const router = useRouter();
  const setTemplate = useTemplates((state) => state.setTemplate);

  useEffect(() => {
    const index = parseInt(router.query.template, 10);
    if (!isNaN(index) && index >= 0 && index < templates.length) {
      setTemplate(index);
    }
  }, [router.query.template, setTemplate]);

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
