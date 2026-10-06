import {
  isRespondentValid,
  type ISurveyRepository,
  type Respondent,
  type SurveySession,
} from '@/domain/survey'

/**
 * Use case to initiate a survey session with respondent validation
 */
export async function startSurveyUseCase(
  repository: ISurveyRepository,
  respondent: Respondent,
): Promise<SurveySession> {
  if (!isRespondentValid(respondent)) {
    throw new Error('Data responden tidak lengkap.')
  }

  return repository.startSurvey(respondent)
}
