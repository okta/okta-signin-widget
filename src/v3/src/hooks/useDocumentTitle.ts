import { getPageTitle } from '../util';
import { useEffect } from 'preact/hooks';
import { useWidgetContext } from '../contexts';

export const useDocumentTitle = (title: string) => {
  const { widgetProps, idxTransaction } = useWidgetContext();
  const pageTitle = getPageTitle(widgetProps, title, idxTransaction);

  useEffect(() => {
    if (typeof pageTitle !== 'undefined') {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  return null;
};
