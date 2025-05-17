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
