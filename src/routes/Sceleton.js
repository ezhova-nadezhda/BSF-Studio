import Sceleton from 'components/views/Sceleton';

import { sceletonPath } from 'helpers/routes';

export default {
  name: 'Sceleton',
  path: sceletonPath(),
  component: Sceleton,
  exact: true,
  strict: true
};