import { useTranslation } from 'react-i18next';

import { CONFIG } from 'src/config-global';

import { PlannerView } from 'src/sections/planner/view/planner-view';

export default function Page() {
  const { t } = useTranslation();

  return (
    <>
      <title>{`${t('pages.planner')} - ${CONFIG.appName}`}</title>
      <PlannerView />
    </>
  );
}
