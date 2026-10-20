import { IndicatorContent } from '../models/indicator-content.model';
import { IndicatorSource } from '../models/indicator-source.model';
import { IndicatorVersion } from '../models/indicator-version.model';
import { Indicator } from '../models/indicator.model';

export const INDICATOR_A111: Indicator = {
  id: 'ind-a111',
  code: 'A.1.1.1',
  title:
    'For delivering the study programme/domain, the HEI has adequate organisational components and an adequate management system.',
  position: 1,
  status: 'ready',
};

export const INDICATOR_A111_SOURCES: readonly IndicatorSource[] = [
  {
    ref: 1,
    documentTitle: 'Carta Universitară UPT',
    sourceType: 'upload',
    page: 8,
    excerpt:
      'Art. 15: Senatul universitar și Consiliul de Administrație constituie structurile deliberative și executive principale pentru gestiunea resurselor academice...',
    provenance: 'Uploaded PDF',
    documentId: 'doc-carta-upt',
  },
  {
    ref: 2,
    documentTitle: 'Regulament CSUD 2024',
    sourceType: 'crawl',
    page: 14,
    excerpt:
      'Consiliul Școlii Doctorale asigură conducerea operativă și aprobă rapoartele de activitate ale conducătorilor de doctorat...',
    provenance: 'From university website (upt.ro)',
    documentId: 'doc-regulament-csud-2024',
  },
  {
    ref: 3,
    documentTitle: 'Organigrama Instituțională UPT',
    sourceType: 'upload',
    excerpt:
      'Comisiile de asigurare a calității (CEAC) sunt direct subordonate Senatului și prezintă rapoarte semestriale.',
    provenance: 'Uploaded',
    documentId: 'doc-organigrama-upt',
  },
  {
    ref: 4,
    documentTitle: 'Hotărârea Senatului nr. 84/2023',
    sourceType: 'crawl',
    page: 3,
    excerpt:
      'Se aprobă procedurile unificate de monitorizare etică pentru laboratoarele de cercetare aplicată...',
    provenance: 'From registry (senat.upt.ro)',
    documentId: 'doc-hotarare-senat-84-2023',
  },
  {
    ref: 5,
    documentTitle: 'Planul Strategic 2024–2029',
    sourceType: 'upload',
    page: 28,
    excerpt:
      'Obiectivul 2.4: Digitalizarea completă a procedurilor de autoevaluare doctorală până în trimestrul III 2025.',
    provenance: 'Uploaded',
    documentId: 'doc-plan-strategic-2024-2029',
  },
];

export const INDICATOR_A111_VERSIONS: readonly IndicatorVersion[] = [
  {
    id: 'ver-a111-v4',
    versionNumber: 4,
    origin: 'edited',
    createdAt: '2024-05-14T09:46:00.000Z',
  },
  {
    id: 'ver-a111-v3',
    versionNumber: 3,
    origin: 'unified',
    createdAt: '2024-05-14T08:00:00.000Z',
  },
  {
    id: 'ver-a111-v2',
    versionNumber: 2,
    origin: 'generated',
    createdAt: '2024-05-13T10:00:00.000Z',
  },
  {
    id: 'ver-a111-v1',
    versionNumber: 1,
    origin: 'generated',
    createdAt: '2024-05-11T10:00:00.000Z',
  },
];

export const INDICATOR_A111_CONTENT: IndicatorContent = {
  sections: [
    {
      id: 'section-facts',
      heading: 'Presentation of the state of facts',
      blocks: [
        {
          id: 'block-facts-1',
          runs: [
            {
              text: 'Universitatea Politehnica Timișoara carries out its doctoral education through the Council for Doctoral University Studies (CSUD) and accredited doctoral schools. The University Charter, art. 15, establishes the Senate and the Board of Administration as the deliberative and executive governance organs responsible for strategic resource allocation',
            },
            { text: '[1]', marks: [{ type: 'citation', sourceRef: 1 }] },
            {
              text: '. The doctoral school in Computer Engineering operates under direct internal oversight, with executive responsibilities delegated to the Doctoral School Council',
            },
            { text: '[2]', marks: [{ type: 'citation', sourceRef: 2 }] },
            { text: '.' },
          ],
        },
        {
          id: 'block-facts-2',
          runs: [
            {
              text: 'All administrative departments submit bi-annual operational status reports directly to the Vice-Rector for Academic Quality',
              marks: [{ type: 'unsourced' }],
            },
          ],
        },
      ],
    },
    {
      id: 'section-analysis',
      heading: 'Analysis',
      blocks: [
        {
          id: 'block-analysis-1',
          runs: [
            {
              text: 'The organizational chart confirms that specialized commissions for quality assurance evaluate curriculum alignment every academic semester',
            },
            { text: '[3]', marks: [{ type: 'citation', sourceRef: 3 }] },
            {
              text: '. However, procedural harmonization remains incomplete regarding inter-departmental research transfers:',
            },
          ],
        },
        {
          id: 'block-analysis-missing-doc',
          runs: [
            {
              text: 'Regulamentul de organizare și funcționare (ROF 2024 actualizat)',
              marks: [{ type: 'missing-doc' }],
            },
          ],
        },
        {
          id: 'block-analysis-edited',
          runs: [
            {
              text: 'During the 2023–2024 academic cycle, Senate Resolution no. 84 consolidated the ethics validation protocols for applied doctoral research, aligning laboratory security with national standards',
              marks: [{ type: 'human-edited' }],
            },
            { text: '[4]', marks: [{ type: 'citation', sourceRef: 4 }] },
            { text: '.' },
          ],
        },
        {
          id: 'block-analysis-2',
          runs: [
            {
              text: 'Faculty tenure evaluations undergo external peer-audit committees prior to senate ratification. ',
            },
            {
              text: 'Student representation in the executive board reached a statutory quota of 25% without exception across all four quarters',
              marks: [{ type: 'unsourced' }],
            },
          ],
        },
      ],
    },
    {
      id: 'section-future',
      heading: 'Future lines of action',
      blocks: [
        {
          id: 'block-future-1',
          runs: [
            {
              text: '1. Digitization of the complete workflow for doctoral advisor annual self-assessment through the integrated institutional portal by Q3 2025',
            },
            { text: '[5]', marks: [{ type: 'citation', sourceRef: 5 }] },
            { text: '.' },
          ],
        },
        {
          id: 'block-future-2',
          runs: [
            {
              text: '2. Revision of the internal operational manual to formalize cross-faculty doctoral advisory committees within the Computer Engineering domain.',
            },
          ],
        },
      ],
    },
  ],
};
