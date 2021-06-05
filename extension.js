const vscode = require('vscode')

const lineDisplayValues = ['on', 'relative']

let currentLineDisplay = null
let firstTime = null
let state = null

const getCurrentLine = () => parseInt(vscode.window.activeTextEditor.selection.active.line + 1)

const goToLine = line => {
	try {
		let editor = vscode.window.activeTextEditor
		let range = editor.document.lineAt(line - 1).range
		editor.selection = new vscode.Selection(range.start, range.end)
		editor.revealRange(range)
	} catch (e) { }
}

const getLineDisplay = async () =>
	await vscode.workspace.getConfiguration('editor')
		.get('lineNumbers')

const setLineDisplay = async value => {
	await vscode.workspace.getConfiguration('editor')
		.update('lineNumbers', value, vscode.ConfigurationTarget.Workspace)
}

const handleLineJump = async direction => {
	if (firstTime && currentLineDisplay === 'relative') {
		firstTime = false
		await setLineDisplay('on')
		return
	}

	await setLineDisplay(lineDisplayValues[++state % 2])

	const relativeLine = await vscode.window.showInputBox({
		prompt: 'Go to relative line',
		placeHolder: 'Relative line...'
	})

	await setLineDisplay(lineDisplayValues[++state % 2])

	const nextLine = direction === 'up' ?
		getCurrentLine() - parseInt(relativeLine) :
		getCurrentLine() + parseInt(relativeLine)

	goToLine(nextLine)
}

const namespace = 'line-jump'

const commands = [{
	id: 'jumpUp',
	handler: () => handleLineJump('up')
}, {
	id: 'jumpDown',
	handler: () => handleLineJump('down')
}]

const activate = async context => {
	currentLineDisplay = await getLineDisplay()
	firstTime = true
	state = lineDisplayValues.indexOf(currentLineDisplay || 'on')

	for (const command of commands) {
		const disposable = vscode.commands.registerCommand(`${namespace}.${command.id}`, command.handler)
		context.subscriptions.push(disposable)
	}
}

const deactivate = () => { }

module.exports = {
	activate,
	deactivate
}
