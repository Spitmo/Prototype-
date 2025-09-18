import { BigQuery } from "@google-cloud/bigquery"

const bigquery = new BigQuery({
  projectId: "YOUR_PROJECT_ID",
  keyFilename: "PATH_TO_YOUR_SERVICE_ACCOUNT_JSON"
})

const datasetId = "chatbot"
const tableId = "messages"

export async function saveMessage(userId: string, text: string, timestamp: number) {
  const rows = [{ userId, text, timestamp }]
  await bigquery.dataset(datasetId).table(tableId).insert(rows)
}

export async function getMessages(userId: string) {
  const query = `
    SELECT text, timestamp FROM \`${bigquery.projectId}.${datasetId}.${tableId}\`
    WHERE userId = @userId
    ORDER BY timestamp ASC
  `
  const options = {
    query,
    params: { userId }
  }
  const [job] = await bigquery.createQueryJob(options)
  const [rows] = await job.getQueryResults()
  return rows
}