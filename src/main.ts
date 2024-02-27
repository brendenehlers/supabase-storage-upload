import * as core from '@actions/core'
import { create, uploadFileToBucket } from './supabase'
import { getFilenames, readFile } from './files'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const repo = core.getInput('repo_directory')
    if (!repo) {
      throw new Error('repository directory is undefined')
    }

    const directory = core.getInput('upload_directory_path')
    if (!directory) {
      throw new Error('directory is undefined')
    }

    const bucket = core.getInput('bucket_name')
    if (!bucket) {
      throw new Error('bucket is undefined')
    }

    const supabaseProjectID = process.env.SUPABASE_PROJECT_ID
    const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN
    if (!supabaseProjectID || !supabaseAccessToken) {
      throw new Error('Supabase credentials are undefined')
    }

    const client = create(supabaseProjectID, supabaseAccessToken)

    const dir = repo + directory
    const filenames = getFilenames(dir)
    if (!filenames.length) {
      core.setOutput('message', `no files in provided directory '${directory}'`)
    }

    for (const filename of filenames) {
      const file = readFile(`${dir}/${filename}`)
      uploadFileToBucket(client, bucket, filename, file)
    }

    core.setOutput('message', 'Files uploaded successfully')
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
