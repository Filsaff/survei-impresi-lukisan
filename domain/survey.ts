export type Impression = {
  id: string
  name: string
}

export type Respondent = {
  id?: string
  name: string
  email: string
  age?: number
  gender?: 'Laki-laki' | 'Perempuan'
  education?: 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2' | 'S3'
}

export const emptyRespondent: Respondent = {
  name: '',
  email: '',
  age: undefined,
}

export type SurveyPainting = {
  position: number
  id: string
  title: string
  detail: string
  image: string
}

export type Survey = {
  id: string
  totalPaintings: number
  paintings: SurveyPainting[]
}

export type SurveyAnswer = {
  paintingId: string
  impressionIds: string[]
}

export type SurveySession = {
  respondent: Respondent
  survey: Survey
  answers: SurveyAnswer[]
}

export function isRespondentValid(
  respondent: Respondent,
) {
  return Boolean(
    respondent.name.trim() &&
      respondent.email.trim() &&
      respondent.gender &&
      respondent.age &&
      respondent.education,
  )
}