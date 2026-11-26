import { create } from 'zustand'

import {
    persist,
} from 'zustand/middleware'

import {
    emptyRespondent,
    type Respondent,
    type ServerPaintingAnswer,
    type SurveyAnswer,
    type SurveySession,
} from '@/domain/survey'

type SurveyStore = {
    session: SurveySession | null
    currentPainting: number
    hydrated: boolean
    loadSession: (
        session: SurveySession,
    ) => void
    setRespondent: (
        respondent: Respondent,
    ) => void
    getSelectedImpressions: (
        paintingId: string,
    ) => string[]
    toggleImpression: (
        paintingId: string,
        impressionId: string,
    ) => void
    goToPainting: (position: number) => void
    syncServerAnswers: (
        serverAnswers: ServerPaintingAnswer[],
        nextPosition?: number | null,
    ) => void
    goNext: () => void
    goPrevious: () => void
    clearProgress: () => void
    setHydrated: (
        hydrated: boolean,
    ) => void
}

export const useSurveyStore = create<SurveyStore>()(
    persist(
        (set, get) => ({
            session: null,
            currentPainting: 1,
            hydrated: false,
            loadSession: (session) => {
                const answeredPaintingIds =
                    session.answers.map(
                        (answer) =>
                            answer.paintingId,
                    )
                const firstUnansweredPainting =
                    session.survey.paintings.find(
                        (painting) =>
                            !answeredPaintingIds.includes(
                                painting.id,
                            ),
                    )
                set({
                    session,
                    currentPainting:
                        firstUnansweredPainting?.position ??
                        session.survey.totalPaintings,
                })
            },
            setRespondent: (respondent) => {
                const currentSession = get().session
                if (!currentSession) {
                    return
                }
                set({
                    session: {
                        ...currentSession,
                        respondent,
                    },
                })
            },
            getSelectedImpressions: (
                paintingId,
            ) => {
                const session = get().session
                if (!session) {
                    return []
                }
                const answer = session.answers.find(
                    (answer) =>
                        answer.paintingId ===
                        paintingId,
                )
                return (answer?.impressionIds ?? [])
            },
            toggleImpression: (paintingId, impressionId,) => {
                const session = get().session
                if (!session) {
                    return
                }
                const existingAnswer =
                    session.answers.find(
                        (answer) =>
                            answer.paintingId ===
                            paintingId,
                    )
                let answers: SurveyAnswer[]
                if (!existingAnswer) {
                    answers = [
                        ...session.answers,
                        {
                            paintingId,
                            impressionIds: [
                                impressionId,
                            ],
                        },
                    ]
                } else {
                    answers = session.answers.map(
                        (answer) => {
                            if (
                                answer.paintingId !==
                                paintingId
                            ) {
                                return answer
                            }

                            const exists = answer.impressionIds.includes(
                                impressionId,
                            )
                            return {
                                ...answer,
                                impressionIds: exists
                                    ? answer.impressionIds.filter(
                                        (id) => id !== impressionId,
                                    )
                                    : [
                                        ...answer.impressionIds,
                                        impressionId,
                                    ],
                            }
                        },
                    )
                }
                set({
                    session: {
                        ...session,
                        answers,
                    },
                })
            },
            goToPainting: (position: number) => {
                const session = get().session
                if (!session) return
                const clamped = Math.max(1, Math.min(position, session.survey.totalPaintings))
                set({ currentPainting: clamped })
            },
            syncServerAnswers: (
                serverAnswers: ServerPaintingAnswer[],
                nextPosition?: number | null,
            ) => {
                const currentSession = get().session
                if (!currentSession) return

                const serverAnswerMap = new Map<string, string[]>()
                for (const sa of serverAnswers) {
                    if (sa.isAnswered && sa.impressionIds.length > 0) {
                        serverAnswerMap.set(sa.paintingId, sa.impressionIds)
                    }
                }

                const updatedAnswers: SurveyAnswer[] = []
                for (const [paintingId, impressionIds] of serverAnswerMap.entries()) {
                    updatedAnswers.push({ paintingId, impressionIds })
                }
                for (const ans of currentSession.answers) {
                    if (!serverAnswerMap.has(ans.paintingId)) {
                        updatedAnswers.push(ans)
                    }
                }

                const serverStatusMap = new Map(
                    serverAnswers.map((sa) => [sa.paintingId, sa.isAnswered])
                )
                const updatedPaintings = currentSession.survey.paintings.map((p) => {
                    const isAnsweredOnServer = serverStatusMap.get(p.id)
                    return isAnsweredOnServer !== undefined
                        ? { ...p, isAnswered: isAnsweredOnServer }
                        : p
                })

                set((state) => ({
                    session: {
                        ...currentSession,
                        survey: {
                            ...currentSession.survey,
                            paintings: updatedPaintings,
                        },
                        answers: updatedAnswers,
                    },
                    currentPainting:
                        nextPosition !== undefined && nextPosition !== null && nextPosition > 0
                            ? Math.min(nextPosition, currentSession.survey.totalPaintings)
                            : state.currentPainting,
                }))
            },
            goNext: () => {
                const session = get().session

                if (!session) {
                    return
                }
                set((state) => ({
                    currentPainting:
                        state.currentPainting <
                            session.survey.totalPaintings
                            ? state.currentPainting + 1
                            : state.currentPainting,
                }))
            },
            goPrevious: () => {
                set((state) => ({
                    currentPainting:
                        state.currentPainting > 1
                            ? state.currentPainting - 1
                            : 1,
                }))
            },
            setHydrated: (hydrated,) => {
                set({
                    hydrated,
                })
            },
            clearProgress: () => {
                set({
                    session: null,
                    currentPainting: 1,
                })
            },
        }),
        {
            name: 'survey-progress',
            onRehydrateStorage: () => (
                state,
            ) => {
                state?.setHydrated(
                    true,
                )
            },
        }
    ),
)