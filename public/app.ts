import { genTsType } from '../src/index'

function querySelector(selector: string) {
  let node = document.querySelector<HTMLElement>(selector)
  if (!node) {
    throw new Error(`querySelector: ${selector} not found`)
  }
  return node
}

let jsonInput = querySelector('#jsonInput') as HTMLTextAreaElement
let typeName = querySelector('#typeName') as HTMLInputElement
let exportType = querySelector('#exportType') as HTMLInputElement
let semiColon = querySelector('#semiColon') as HTMLInputElement
let includeSample = querySelector('#includeSample') as HTMLInputElement
let unionType = querySelector('#unionType') as HTMLInputElement
let indent = querySelector('#indent') as HTMLInputElement
let indentStep = querySelector('#indentStep') as HTMLInputElement
let errorMessage = querySelector('#errorMessage') as HTMLInputElement
let outputType = querySelector('#outputType') as HTMLInputElement
let copyButton = querySelector('#copyButton') as HTMLButtonElement

window.addEventListener('input', () => {
  updateOutput()
})

function updateOutput() {
  let input = jsonInput.value.trim()
  if (!input) {
    outputType.textContent = ''
    return
  }
  try {
    let sample = JSON.parse(input)
    let type = genTsType(sample, {
      /* type declaration options */
      name: typeName.value || undefined,
      export: exportType.checked,
      /* formatting options */
      indent: indent.value || undefined,
      indent_step: indentStep.value || undefined,
      semi_colon: semiColon.checked,
      include_sample: includeSample.checked,
      /* type inference options */
      union_type: unionType.checked,
    })
    outputType.textContent = type
    errorMessage.textContent = ''
    errorMessage.classList.remove('visible')
  } catch (error) {
    console.error(error)
    errorMessage.textContent = error.message
    errorMessage.classList.add('visible')
  }
}

updateOutput()

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(outputType.textContent || '')
    copyButton.textContent = 'Copied!'
    copyButton.classList.add('copied')
    setTimeout(() => {
      copyButton.textContent = 'Copy'
      copyButton.classList.remove('copied')
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
    copyButton.textContent = 'Failed to copy'
    setTimeout(() => {
      copyButton.textContent = 'Copy'
    }, 2000)
  }
})
