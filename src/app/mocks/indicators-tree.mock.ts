import { IndicatorDomain } from '../models/indicator-tree.model';

export const INDICATORS_TREE: readonly IndicatorDomain[] = [
  {
    id: 'domain-a',
    label: 'Domeniul A · Capacitate',
    reviewed: 6,
    total: 12,
    criteria: [
      {
        id: 'criterion-a1',
        label: 'Criteriul A.1 Structuri instituționale',
        indicators: [
          {
            code: 'A.1.1.1',
            title: 'Management system & organizational components',
            status: 'draft',
          },
          {
            code: 'A.1.1.2',
            title: 'Funcționarea structurilor de conducere',
            status: 'review',
          },
          {
            code: 'A.1.2.1',
            title: 'Spații didactice și infrastructură IT',
            status: 'review',
          },
          {
            code: 'A.1.2.2',
            title: 'Fondul de carte și abonamente baze de date',
            status: 'empty',
          },
        ],
      },
      {
        id: 'criterion-a2',
        label: 'Criteriul A.2 Baza materială',
        indicators: [
          {
            code: 'A.2.1.1',
            title: 'Laboratoare de cercetare doctorală',
            status: 'review',
          },
          {
            code: 'A.2.1.2',
            title: 'Echipamente și platforme experimentale',
            status: 'review',
          },
          {
            code: 'A.2.2.1',
            title: 'Resurse financiare pentru cercetare',
            status: 'draft',
          },
          {
            code: 'A.2.2.2',
            title: 'Sustenabilitatea bugetară a școlii doctorale',
            status: 'empty',
          },
        ],
      },
      {
        id: 'criterion-a3',
        label: 'Criteriul A.3 Resurse umane',
        indicators: [
          {
            code: 'A.3.1.1',
            title: 'Calificarea conducătorilor de doctorat',
            status: 'review',
          },
          {
            code: 'A.3.1.2',
            title: 'Raportul doctoranzi per conducător',
            status: 'review',
          },
          {
            code: 'A.3.2.1',
            title: 'Politica de dezvoltare a personalului academic',
            status: 'draft',
          },
          {
            code: 'A.3.2.2',
            title: 'Evaluarea periodică a cadrelor didactice',
            status: 'empty',
          },
        ],
      },
    ],
  },
  {
    id: 'domain-b',
    label: 'Domeniul B · Eficacitate',
    reviewed: 8,
    total: 18,
    criteria: [
      {
        id: 'criterion-b1',
        label: 'Criteriul B.1 Conținutul programelor',
        indicators: [
          {
            code: 'B.1.1.1',
            title: 'Planul de învățământ al programului doctoral',
            status: 'review',
          },
          {
            code: 'B.1.1.2',
            title: 'Relevanța disciplinelor avansate',
            status: 'review',
          },
          {
            code: 'B.1.2.1',
            title: 'Programul de pregătire bazat pe studii universitare',
            status: 'review',
          },
          {
            code: 'B.1.2.2',
            title: 'Programul individual de cercetare științifică',
            status: 'draft',
          },
          {
            code: 'B.1.3.1',
            title: 'Corelarea cu direcțiile strategice de cercetare',
            status: 'empty',
          },
          {
            code: 'B.1.3.2',
            title: 'Internaționalizarea curriculei doctorale',
            status: 'empty',
          },
        ],
      },
      {
        id: 'criterion-b2',
        label: 'Criteriul B.2 Rezultatele învățării',
        indicators: [
          {
            code: 'B.2.1.1',
            title: 'Publicații științifice ale doctoranzilor',
            status: 'review',
          },
          {
            code: 'B.2.1.2',
            title: 'Participarea la conferințe de specialitate',
            status: 'review',
          },
          {
            code: 'B.2.2.1',
            title: 'Rata de finalizare a tezelor de doctorat',
            status: 'review',
          },
          {
            code: 'B.2.2.2',
            title: 'Durata medie a studiilor doctorale',
            status: 'draft',
          },
          {
            code: 'B.2.3.1',
            title: 'Inserția profesională a absolvenților',
            status: 'empty',
          },
          {
            code: 'B.2.3.2',
            title: 'Mobilități internaționale ale doctoranzilor',
            status: 'empty',
          },
        ],
      },
      {
        id: 'criterion-b3',
        label: 'Criteriul B.3 Activitatea de cercetare',
        indicators: [
          {
            code: 'B.3.1.1',
            title: 'Granturi și contracte de cercetare active',
            status: 'review',
          },
          {
            code: 'B.3.1.2',
            title: 'Colaborări cu mediul socio-economic',
            status: 'review',
          },
          {
            code: 'B.3.2.1',
            title: 'Brevete și transfer tehnologic',
            status: 'draft',
          },
          {
            code: 'B.3.2.2',
            title: 'Valorificarea rezultatelor cercetării',
            status: 'draft',
          },
          {
            code: 'B.3.3.1',
            title: 'Etica și deontologia cercetării doctorale',
            status: 'empty',
          },
          {
            code: 'B.3.3.2',
            title: 'Infrastructura de cercetare interdisciplinară',
            status: 'empty',
          },
        ],
      },
    ],
  },
  {
    id: 'domain-c',
    label: 'Domeniul C · Management',
    reviewed: 5,
    total: 9,
    criteria: [
      {
        id: 'criterion-c1',
        label: 'Criteriul C.1 Managementul calității',
        indicators: [
          {
            code: 'C.1.1.1',
            title: 'Structuri și politici pentru asigurarea calității',
            status: 'review',
          },
          {
            code: 'C.1.1.2',
            title: 'Proceduri de evaluare periodică internă',
            status: 'review',
          },
          {
            code: 'C.1.2.1',
            title: 'Mecanisme de feedback de la doctoranzi',
            status: 'review',
          },
        ],
      },
      {
        id: 'criterion-c2',
        label: 'Criteriul C.2 Transparență publică',
        indicators: [
          {
            code: 'C.2.1.1',
            title: 'Informații publice despre programele doctorale',
            status: 'review',
          },
          {
            code: 'C.2.1.2',
            title: 'Publicarea tezelor și a rezumatelor',
            status: 'draft',
          },
          {
            code: 'C.2.2.1',
            title: 'Baza de date cu alumni și cariere',
            status: 'empty',
          },
        ],
      },
      {
        id: 'criterion-c3',
        label: 'Criteriul C.3 Îmbunătățire continuă',
        indicators: [
          {
            code: 'C.3.1.1',
            title: 'Planuri de măsuri corective și preventive',
            status: 'review',
          },
          {
            code: 'C.3.1.2',
            title: 'Monitorizarea implementării recomandărilor',
            status: 'draft',
          },
          {
            code: 'C.3.2.1',
            title: 'Analiza anuală a performanței școlii doctorale',
            status: 'empty',
          },
        ],
      },
    ],
  },
];
