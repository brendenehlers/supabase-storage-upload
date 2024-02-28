// /**
//  * Unit tests for the action's main functionality, src/main.ts
//  *
//  * These should be run as if the action was called from a workflow.
//  * Specifically, the inputs listed in `action.yml` should be set as environment
//  * variables following the pattern `INPUT_<INPUT_NAME>`.
//  */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as supabase from '../src/supabase'
import * as files from '../src/files'

// // Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// // Other utilities
// const timeRegex = /^\d{2}:\d{2}:\d{2}/

const supabaseId = 'abcd'
const supabaseKey = '1234'

// // Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
// let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

// Mock files
let getFilenamesMock: jest.SpiedFunction<typeof files.getFilenames>
let readFileMock: jest.SpiedFunction<typeof files.readFile>

// Mock supabase
let createMock: jest.SpiedFunction<typeof supabase.create>
let uploadFileMock: jest.SpiedFunction<typeof supabase.uploadFileToBucket>

describe('action', () => {
  const OLD_ENV = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    // errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest
      .spyOn(core, 'setFailed')
      .mockImplementation(msg => console.log(msg))
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

    getFilenamesMock = jest.spyOn(files, 'getFilenames').mockImplementation()
    readFileMock = jest.spyOn(files, 'readFile').mockImplementation()

    createMock = jest.spyOn(supabase, 'create').mockImplementation()
    uploadFileMock = jest
      .spyOn(supabase, 'uploadFileToBucket')
      .mockImplementation()

    process.env = {
      ...OLD_ENV,
      SUPABASE_PROJECT_ID: supabaseId,
      SUPABASE_API_KEY: supabaseKey
    }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('does not error', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repo_directory':
          return '/path/to'
        case 'upload_directory_path':
          return 'directory/path'
        case 'bucket_name':
          return 'bucket'
        default:
          return ''
      }
    })

    readFileMock.mockImplementation((filepath: string) => {
      if (filepath.includes('myfile1.html')) {
        return Buffer.from('file 1 contents')
      } else if (filepath.includes('myfile2.html')) {
        return Buffer.from('file 2 contents')
      } else {
        throw new Error('File does not exist')
      }
    })

    getFilenamesMock.mockImplementation(() => {
      return ['myfile1.html', 'myfile2.html']
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledTimes(0)
    expect(debugMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalledWith(
      'message',
      'Files uploaded successfully'
    )

    expect(createMock).toHaveBeenNthCalledWith(1, supabaseId, supabaseKey)

    expect(getFilenamesMock).toHaveBeenCalledWith('/path/to/directory/path')
    expect(readFileMock).toHaveBeenCalledTimes(2)
    expect(readFileMock).toHaveBeenNthCalledWith(
      1,
      '/path/to/directory/path/myfile1.html'
    )
    expect(readFileMock).toHaveBeenNthCalledWith(
      2,
      '/path/to/directory/path/myfile2.html'
    )

    expect(uploadFileMock).toHaveBeenCalledTimes(2)
  })

  it('tries to read bad file', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'repo_directory':
          return '/path/to'
        case 'upload_directory_path':
          return 'directory/path'
        case 'bucket_name':
          return 'bucket'
        default:
          return ''
      }
    })

    readFileMock.mockImplementation(() => {
      throw new Error('File does not exist')
    })

    getFilenamesMock.mockImplementation(() => {
      return ['myfile2.html']
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalled()
  })
})

// describe('action', () => {
//   beforeEach(() => {
//     jest.clearAllMocks()

//     debugMock = jest.spyOn(core, 'debug').mockImplementation()
//     errorMock = jest.spyOn(core, 'error').mockImplementation()
//     getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
//     setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
//     setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
//   })

//   it('sets the time output', async () => {
//     // Set the action's inputs as return values from core.getInput()
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'milliseconds':
//           return '500'
//         default:
//           return ''
//       }
//     })

//     await main.run()
//     expect(runMock).toHaveReturned()

//     // Verify that all of the core library functions were called correctly
//     expect(debugMock).toHaveBeenNthCalledWith(1, 'Waiting 500 milliseconds ...')
//     expect(debugMock).toHaveBeenNthCalledWith(
//       2,
//       expect.stringMatching(timeRegex)
//     )
//     expect(debugMock).toHaveBeenNthCalledWith(
//       3,
//       expect.stringMatching(timeRegex)
//     )
//     expect(setOutputMock).toHaveBeenNthCalledWith(
//       1,
//       'time',
//       expect.stringMatching(timeRegex)
//     )
//     expect(errorMock).not.toHaveBeenCalled()
//   })

//   it('sets a failed status', async () => {
//     // Set the action's inputs as return values from core.getInput()
//     getInputMock.mockImplementation(name => {
//       switch (name) {
//         case 'milliseconds':
//           return 'this is not a number'
//         default:
//           return ''
//       }
//     })

//     await main.run()
//     expect(runMock).toHaveReturned()

//     // Verify that all of the core library functions were called correctly
//     expect(setFailedMock).toHaveBeenNthCalledWith(
//       1,
//       'milliseconds not a number'
//     )
//     expect(errorMock).not.toHaveBeenCalled()
//   })
// })
