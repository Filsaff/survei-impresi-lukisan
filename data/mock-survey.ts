import type {
  Impression,
  Respondent,
  Survey,
  SurveyAnswer,
  SurveyPainting,
  SurveySession,
} from '@/domain/survey'

export const mockRespondent: Respondent = {
  id: 'respondent-001',
  name: 'Saf',
  gender: 'Laki-laki',
  education: 'S1',
  email: 'filsafelang@gmail.com',
  age: 22,
}

export const impressions: Impression[] = [
  {
    id: 'impression-1',
    name: 'Tenang',
  },
  {
    id: 'impression-2',
    name: 'Bahagia',
  },
  {
    id: 'impression-3',
    name: 'Sedih',
  },
  {
    id: 'impression-4',
    name: 'Dramatis',
  },
  {
    id: 'impression-5',
    name: 'Klasik',
  },
  {
    id: 'impression-6',
    name: 'Megah',
  },
  {
    id: 'impression-7',
    name: 'Kelam',
  },
  {
    id: 'impression-8',
    name: 'Damai',
  },
  {
    id: 'impression-9',
    name: 'Kacau',
  },
  {
    id: 'impression-10',
    name: 'Mencekam',
  },
  {
    id: 'impression-11',
    name: 'Heroik',
  },
  {
    id: 'impression-12',
    name: 'Melankolis',
  },
  {
    id: 'impression-13',
    name: 'Magis',
  },
  {
    id: 'impression-14',
    name: 'Kuno',
  },
  {
    id: 'impression-15',
    name: 'Sakral',
  },
  {
    id: 'impression-16',
    name: 'Gelisah',
  },
  {
    id: 'impression-17',
    name: 'Bersemangat',
  },
  {
    id: 'impression-18',
    name: 'Misterius',
  },
]

const DEFAULT_PAINTING_IMAGE =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Html%20%E2%86%92%20Body%20%281%29-f5eKLfyHBZtLW9TKBQ7MrtgJeNE8Lf.png'

const S3_BASE_URL = process.env.NEXT_PUBLIC_S3_BASE_URL?.replace(/\/$/, '')

export const surveyPaintings: SurveyPainting[] =
  Array.from({ length: 20 }, (_, index) => ({
    position: index + 1,

    id: `painting-${index + 1}`,

    title:
      index === 6
        ? 'Pangeran Diponegoro Memimpin Pasukan'
        : `Lukisan Budaya Indonesia ${index + 1}`,

    detail:
      index === 6
        ? 'Karya Anonim, c. 1850. Cat Minyak pada Kanvas.'
        : 'Koleksi budaya Indonesia. Cat minyak pada kanvas.',

    image: S3_BASE_URL
      ? `${S3_BASE_URL}/${index + 1}.jpg`
      : DEFAULT_PAINTING_IMAGE,
  }))

  export const mockSurvey: Survey = {
    id: 'survey-mock-001',
    totalPaintings: 20,
    paintings: surveyPaintings,
  }

  export const mockAnswers: SurveyAnswer[] = [
    {
      paintingId: 'painting-1',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-2',
      impressionIds: [
        'impression-3',
        'impression-12',
      ],
    },
    {
      paintingId: 'painting-3',
      impressionIds: [
        'impression-4',
        'impression-6',
      ],
    },
    {
      paintingId: 'painting-4',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-5',
      impressionIds: [
        'impression-3',
        'impression-12',
      ],
    },
    {
      paintingId: 'painting-6',
      impressionIds: [
        'impression-4',
        'impression-6',
      ],
    },
    {
      paintingId: 'painting-7',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-8',
      impressionIds: [
        'impression-3',
        'impression-12',
      ],
    },
    {
      paintingId: 'painting-9',
      impressionIds: [
        'impression-4',
        'impression-6',
      ],
    },
    {
      paintingId: 'painting-10',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-11',
      impressionIds: [
        'impression-3',
        'impression-12',
      ],
    },
    {
      paintingId: 'painting-12',
      impressionIds: [
        'impression-4',
        'impression-6',
      ],
    },
    {
      paintingId: 'painting-13',
      impressionIds: [
        'impression-4',
        'impression-6',
      ],
    },
    {
      paintingId: 'painting-14',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-15',
      impressionIds: [
        'impression-3',
        'impression-2',
      ],
    },
    {
      paintingId: 'painting-16',
      impressionIds: [
        'impression-4',
        'impression-5',
      ],
    },
    {
      paintingId: 'painting-17',
      impressionIds: [
        'impression-1',
        'impression-8',
      ],
    },
    {
      paintingId: 'painting-18',
      impressionIds: [
        'impression-3',
        'impression-7',
      ],
    },
    {
      paintingId: 'painting-19',
      impressionIds: [
        'impression-4',
        'impression-3',
      ],
    },
  ]

const existingSession: SurveySession = {
  respondent: {
    id: 'respondent-001',
    name: 'Saf Study',
    email: 'saf@email.com',
    gender: 'Laki-laki',
    age: 22,
    education: 'S1',
  },

  survey: mockSurvey,

  answers: [
    {
      paintingId: 'painting-1',

      impressionIds: [
        'impression-1',
        'impression-2',
      ],
    },

    {
      paintingId: 'painting-2',

      impressionIds: [
        'impression-3',
      ],
    },
  ],
}

