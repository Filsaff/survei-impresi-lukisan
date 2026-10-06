import {
  isRespondentValid,
  type ISurveyRepository,
  type SurveySession,
  type SurveySubmissionResult,
} from '@/domain/survey'

/**
 * Use case to validate and submit a completed survey session
 */
export async function submitSurveyUseCase(
  repository: ISurveyRepository,
  session: SurveySession,
): Promise<SurveySubmissionResult> {
  if (!session || !session.respondent) {
    throw new Error('Sesi survei tidak valid.')
  }

  if (!isRespondentValid(session.respondent)) {
    throw new Error('Data responden tidak lengkap.')
  }

  if (!session.answers || session.answers.length === 0) {
    throw new Error('Jawaban survei tidak boleh kosong.')
  }

  return repository.submitSurvey(session)
}
