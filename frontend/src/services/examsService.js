import apiClient from './apiClient'

const EXAMS_PATH = '/exams/'

/**
 * Reads one page of the paginated exam listing. The API answers with
 * { count, next, previous, results }, never with a bare array.
 */
export async function listExams(pageUrl = EXAMS_PATH) {
  const { data } = await apiClient.get(pageUrl)
  return data
}

export async function createExam(payload) {
  const { data } = await apiClient.post(EXAMS_PATH, payload)
  return data
}

export async function deleteExam(examId) {
  await apiClient.delete(`${EXAMS_PATH}${examId}/`)
}
