# Supabase Storage Upload Action

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)

<!-- [![Coverage](./badges/coverage.svg)](./badges/coverage.svg) -->

This action solves a problem I ran into, where I needed to upload files to a
Supabase Storage bucket as part of a CD/CI pipeline. It uses the
[Supabase JS](https://github.com/supabase/supabase-js) client to upsert the
provided files into a given storage bucket. It will upload all the files in the
repository directory provided by the `upload_directory_path` input to the bucket
provided by the `bucket_name` input. If an error occurs when uploading a file,
the action will fail and no more files will be uploaded (future feature
potential). All files that had been uploaded to that point will not be reverted.
This is my first custom GitHub Action, so any constructive feedback is
appreciated.

This action was built from the
[TypeScript Action Template](https://github.com/actions/typescript-action).
Please refer to that repository for questions related to the structure of this
project.

If you're using this project and have any questions, issues, or feature
requests, feel free to create an issue detailing them.

## Using the action

This action requires two environment variables to be set: `SUPABASE_PROJECT_ID`
and `SUPABASE_API_KEY`.

`SUPABASE_PROJECT_ID` is the reference ID for your project.

`SUPABASE_API_KEY` is the access token for your project, either the `anon` or
the `service role`. It's helpful to keep in mind that if RLS isn't setup for
your bucket, you need to use the `service role` to have this action work.

The action also has three input parameters: `repo_directory`,
`upload_directory_path`, and `bucket_name`.

`repo_directory` is the path within the action to your repository. It defaults
to `${{ github.workspace }}`.

`upload_directory_path` is the path within your repository to the files you want
to upload. Don't start this parameter with a leading slash.

`bucket_name` is the Supabase bucket you want to upload the files to.

You must run the [Checkout Action](https://github.com/actions/checkout) prior to
running this action.

Example of using this action:

```yaml
name: Upload to Supabase Storage

on:
  push:

jobs:
  deploy:
    runs-on: ubuntu-22.04

    env:
      SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      SUPABASE_API_KEY: ${{ secrets.SUPABASE_API_KEY }}

    steps:
      - uses: actions/checkout@v3

      - uses: brendenehlers/supabase-storage-upload@v1
        id: test-action
        with:
          repo_directory: ${{ github.workspace }}
          upload_directory_path: 'path/to/files'
          bucket_name: 'my-new-bucket'

      - name: Print Output
        id: output
        run: echo "${{ steps.test-action.outputs.message }}"
```
