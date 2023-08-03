import { Uri, commands, window, workspace } from 'vscode'
import type { TextEditor, WorkspaceFolder } from 'vscode'

function memorize<T extends () => any>(fn: T): (immediate?: boolean) => ReturnType<T> {
  let closureRes: ReturnType<T>
  return (immediate = false) => {
    if (!closureRes || immediate)
      closureRes = fn()
    return closureRes
  }
}

export const getProjectPath = memorize((): Uri | undefined => {
  const workspaceFolders = workspace.workspaceFolders
  if (!workspaceFolders || workspaceFolders.length === 1) {
    return workspaceFolders?.[0]?.uri
  }
  else {
    const activeTextEditor: TextEditor | undefined = window.activeTextEditor
    if (activeTextEditor) {
      const workspaceFolder = workspaceFolders.find((folder: WorkspaceFolder) => activeTextEditor.document.uri.path.startsWith(folder.uri.path))
      return workspaceFolder?.uri
    }
  }
})

export const getPackageJson = memorize(async (): Promise<Record<string, string> | undefined> => {
  const projectPath = getProjectPath()
  if (!projectPath)
    return
  const packjsonPathUri = Uri.joinPath(projectPath, './package.json')
  try {
    const packageJsonText = (await workspace.openTextDocument(packjsonPathUri)).getText()
    return JSON.parse(packageJsonText)
  }
  catch (error) {
    return undefined
  }
})

export const getScripts = memorize(async () => {
  const packageJson = await getPackageJson()

  if (!packageJson)
    return
  const scripts = Object.keys(packageJson.scripts).sort((a, b) => a.localeCompare(b))
  return scripts
})

// TODO: 校验是否已经有创建好的terminal
export function runScriptInTerminal(scriptName: string) {
  const terminal = window.createTerminal('npmscript')
  terminal.show()
  terminal.sendText(`npm run ${scriptName}`)
}

// TODO: 校验是否已经有创建好的terminal
export function debugScriptInTerminal(scriptName: string) {
  const projectPath = getProjectPath()
  if (!projectPath)
    return
  commands.executeCommand(
    'extension.js-debug.createDebuggerTerminal',
    `npm run ${scriptName}`,
    { uri: projectPath },
    {
      cwd: projectPath.path,
    },
  )
}

export async function run(immediate?: boolean, scriptName?: string) {
  const scripts = await getScripts(immediate)
  if (!scripts) {
    window.showWarningMessage('no npm scripts found')
    return
  }
  if (scriptName && scripts.includes(scriptName)) {
    runScriptInTerminal(scriptName)
    return
  }
  const chosedRes = await window.showQuickPick(scripts)
  if (chosedRes)
    runScriptInTerminal(chosedRes)
}

export async function debug(immediate?: boolean, scriptName?: string) {
  const scripts = await getScripts(immediate)
  if (!scripts) {
    window.showWarningMessage('no npm scripts found')
    return
  }
  if (scriptName && scripts.includes(scriptName)) {
    debugScriptInTerminal(scriptName)
    return
  }
  const chosedRes = await window.showQuickPick(scripts)
  if (chosedRes)
    debugScriptInTerminal(chosedRes)
}
