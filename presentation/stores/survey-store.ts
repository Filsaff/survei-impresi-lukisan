import { create } from 'zustand'

import {
    persist,
} from 'zustand/middleware'

import {
    emptyRespondent,
    type Respondent,
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