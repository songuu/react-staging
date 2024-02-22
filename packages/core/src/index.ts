import { grey } from 'kleur/colors'

import prompts from 'prompts'

import getCustomTemplate from './custom-template';
import getFullTemplate from './full-template';


async function init() {
  console.log(`${grey(`create-stage`)}`)

  /* 
  * 确认完整模板还是自定义模板
  */
  const { template } = await prompts({
    type: 'select',
    name: 'template',
    message: '请选择模板',
    choices: [
      { title: '完整模板', value: 'full' },
      { title: '自定义模板', value: 'custom' }
    ]
  })

  if (template === 'full') {
    console.log('full')
    getFullTemplate().catch((e) => {
      console.error(e)
    })
  } else {
    console.log('custom')
    getCustomTemplate().catch((e) => {
      console.error(e)
    })
  }
}

init().catch((e) => {
  console.error(e)
})