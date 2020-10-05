interface RuncaseRawData {
  input: File
  output: File
  desc?: string
}

interface SubtaskRawData {
  name: string
  timeLimit: number
  memoryLimit: number
  score: number
  runcases: RuncaseRawData[]
  dependency: string[]
}

interface TraditionalRawData {
  spj?: { file: File; language: string }
  subtasks: SubtaskRawData[]
}

const readFile = (file: File) => {
  const reader = new FileReader()
  reader.readAsText(file)
  return new Promise<string>(resolve => {
    reader.onload = function() {
      resolve(this.result!.toString())
    }
  })
}

export const generateData = async (files: File[]): Promise<TraditionalRawData> => {
  const map = new Map<string, File>()
  for (const file of files) {
    map.set(file.name, file)
  }
  let config: TraditionalRawData
  if (map.has('config.json')) {
    config = JSON.parse(await readFile(map.get('config.json')!)) as TraditionalRawData
    const ensure = (name: string) => {
      if (map.has(name)) return map.get(name)!
      throw new Error(`File ${name} not found`)
    }
    if (config.spj) config.spj.file = ensure(config.spj.file as any)
    for (const subtask of config.subtasks) {
      for (const runcase of subtask.runcases) {
        runcase.input = ensure(runcase.input as any)
        runcase.output = ensure(runcase.output as any)
      }
    }
  } else {
    const may = new Set<string>()
    const runcases: RuncaseRawData[] = []
    for (const file of files) {
      let filename = file.name
      filename = filename.substring(0, filename.lastIndexOf('.'))
      if (!filename) continue
      const ext = file.name.substr(filename.length + 1)
      if (!ext) continue
      may.add(filename)
    }
    for (const name of may) {
      if (map.has(name + '.in')) {
        if (map.has(name + '.ans')) {
          runcases.push({ input: map.get(name + '.in')!, output: map.get(name + '.ans')!, desc: name })
        } else if (map.has(name + '.out')) {
          runcases.push({ input: map.get(name + '.in')!, output: map.get(name + '.out')!, desc: name })
        }
      }
    }
    config = {
      subtasks: [
        {
          name: 'Default',
          timeLimit: 1,
          memoryLimit: 512 * 1024,
          score: 100,
          runcases,
          dependency: []
        }
      ]
    }
  }
  return config
}
