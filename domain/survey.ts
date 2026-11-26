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
  education?: 'SD' | 'SMP' | 'SMA' | 'SMA / sederajat' | 'D3' | 'S1' | 'S2' | 'S3' | 'S2 / S3'
  allowAdultContent?: boolean
}

export const emptyRespondent: Respondent = {
  name: '',
  email: '',
  age: undefined,
  allowAdultContent: true,
}

export type SurveyPainting = {
  position: number
  id: string
  sessionPaintingId?: string
  imageKey?: string
  title: string
  detail: string
  image: string
  isAnswered?: boolean
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

export type SurveySubmissionResult = {
  success: boolean
  respondentId: string
}

export type ApiErrorAction = 'RESET_SESSION' | 'REDIRECT_THANK_YOU' | 'RETRY' | 'GO_HOME'

export type ApiErrorResponse = {
  success: false
  code: string
  title: string
  error: string
  action?: ApiErrorAction
}

export class SurveyApiError extends Error {
  readonly code: string
  readonly title: string
  readonly action?: ApiErrorAction

  constructor(
    message: string,
    code = 'UNKNOWN_ERROR',
    title = 'Pemberitahuan Sistem',
    action?: ApiErrorAction
  ) {
    super(message)
    this.name = 'SurveyApiError'
    this.code = code
    this.title = title
    this.action = action
  }
}

export type AllocatedPainting = {
  sessionPaintingId: string
  paintingId: string
  displayOrder: number
  title: string
  detail: string
  imageKey: string
  imageUrl: string
  isAnswered: boolean
  selectedImpressionIds: string[]
}

export type ActiveSurveySession = {
  id: string
  respondentId: string
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
  startedAt: string
  expiresAt: string
  totalPaintings: number
  answeredCount: number
  nextOrder: number
  paintings: AllocatedPainting[]
}

export type StartSurveyResult = {
  success: boolean
  resumed: boolean
  session: ActiveSurveySession
}

export type SaveAnswerInput = {
  sessionId: string
  sessionPaintingId: string
  impressionIds: string[]
}

export type ServerPaintingAnswer = {
  paintingId: string
  sessionPaintingId: string
  displayOrder: number
  isAnswered: boolean
  impressionIds: string[]
}

export type SaveAnswerResult = {
  success: boolean
  sessionPaintingId: string
  answeredCount: number
  totalPaintings: number
  isSessionCompleted: boolean
  nextUnansweredPosition?: number | null
  serverAnswers?: ServerPaintingAnswer[]
}

export type CompleteSurveyInput = {
  sessionId: string
}

export type CompleteSurveyResult = {
  success: boolean
  completedAt: string
}

export function resolvePaintingImageUrl(imageKey: string): string {
  if (!imageKey) return ''
  if (imageKey.startsWith('http://') || imageKey.startsWith('https://')) {
    return imageKey
  }
  const baseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL?.replace(/\/$/, '') || '/api/images'
  return `${baseUrl}/${imageKey}`
}

export interface ISurveyRepository {
  getSurvey(): Survey
  getPaintings(): SurveyPainting[]
  getPainting(position: number): SurveyPainting | undefined
  getImpressions(): Impression[]
  startSurvey(respondent: Respondent): Promise<SurveySession>
  getCurrentSession(sessionId: string): Promise<ActiveSurveySession>
  saveAnswer(input: SaveAnswerInput): Promise<SaveAnswerResult>
  completeSurvey(input: CompleteSurveyInput): Promise<CompleteSurveyResult>
  submitSurvey(session: SurveySession): Promise<SurveySubmissionResult>
}

export const EMAIL_LETTERS_DOTS_REGEX =
  /^[a-zA-Z]+(?:\.[a-zA-Z]+)*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function isRespondentValid(
  respondent: Respondent,
) {
  return Boolean(
    respondent.name?.trim() &&
      respondent.email?.trim() &&
      respondent.gender &&
      respondent.age &&
      respondent.age >= 1 &&
      respondent.age <= 120 &&
      respondent.education,
  )
}