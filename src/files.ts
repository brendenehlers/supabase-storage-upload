import { readFileSync, readdirSync } from 'fs'

export const getFilenames = (dir: string): string[] => {
  const files = readdirSync(dir)
  return files
}

export const readFile = (filepath: string): Buffer => {
  const file = readFileSync(filepath)
  return file
}
