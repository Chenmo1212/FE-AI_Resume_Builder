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
    if (!router.isReady) return;
    const index = parseInt(router.query.template, 10);
    if (!isNaN(index) && index >= 0 && index < templates.length) {
      // URL has a valid template param — apply it to the store
      setTemplate(index);
    } else {
      // No template param — write the current store index into the URL
      const currentIndex = useTemplates.getState().index;
      router.replace(
        { query: { ...router.query, template: currentIndex } },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady, router.query.template]); // eslint-disable-line react-hooks/exhaustive-deps

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
