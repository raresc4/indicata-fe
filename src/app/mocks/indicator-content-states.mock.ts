import { IndicatorContent } from '../models/indicator-content.model';

export const INDICATOR_CONTENT_EMPTY: IndicatorContent = {
  sections: [],
};

export const INDICATOR_CONTENT_GENERATING: IndicatorContent = {
  sections: [
    {
      id: 'section-facts',
      heading: 'Presentation of the state of facts',
      blocks: [
        {
          id: 'block-generating-1',
          runs: [
            {
              text: 'Universitatea Politehnica Timișoara organizes its doctoral programs under the framework of the University Charter, art. 15, which delineates the jurisdictional scope between the Senate and the Board of Administration',
            },
          ],
        },
      ],
    },
  ],
};

export const INDICATOR_CONTENT_SOURCED: IndicatorContent = {
  sections: [
    {
      id: 'section-facts',
      heading: 'Presentation of the state of facts',
      blocks: [
        {
          id: 'block-sourced-1',
          runs: [
            {
              text: 'Universitatea Politehnica Timișoara carries out its doctoral education through the Council for Doctoral University Studies (CSUD) and accredited doctoral schools. All citations and regulatory linkages are verified.',
            },
          ],
        },
        {
          id: 'block-sourced-2',
          runs: [
            {
              text: 'Institutional Charter, Senate Decision no. 84, and Operational Regulations have been synchronized with zero discrepancy.',
            },
          ],
        },
      ],
    },
  ],
};
