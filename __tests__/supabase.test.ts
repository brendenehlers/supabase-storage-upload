import * as supabase from '@supabase/supabase-js'
import { buildUrl, create } from '../src/supabase'

let createClientMock: jest.SpiedFunction<typeof supabase.createClient>

describe('supabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    createClientMock = jest.spyOn(supabase, 'createClient').mockImplementation()
  })

  it('tests buildUrl', () => {
    const url = buildUrl('abcdef')

    expect(url).toBe('https://abcdef.supabase.co')
  })

  it('tests buildClient', () => {
    create('abcdef', '12345')

    expect(createClientMock).toHaveBeenNthCalledWith(
      1,
      'https://abcdef.supabase.co',
      '12345'
    )
  })
})
