import { commands } from 'vscode'
import { debug, run } from './npmScript'
export function activate() {
  commands.registerCommand('vscode-npmscript.run', run)
  commands.registerCommand('vscode-npmscript.debug', debug)
  // workspace.onDidChangeWorkspaceFolders(() => {
  //   commands.registerCommand('vscode-npmscript.run', run.bind(null, true))
  //   commands.registerCommand('vscode-npmscript.debug', debug.bind(null, true))
  // })
}
