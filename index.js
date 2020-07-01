const { parse } = require('@vue/component-compiler-utils')
const { parseComponent,compile } = require('vue-template-compiler')
const path = require('path');

module.exports = function (context) {
  const {filePath, log} = context;
  let {content} = context;

  let parsed = parseComponent(content)
  const template = parsed.template ? parsed.template.content : '';
  const script = parsed.script ? parsed.script.content : '';

  const templateEscaped = template.trim().replace(/`/g, '\\`');
  const scriptWithTemplate = script.match(/export default ?\{/)
    ? script.replace(/export default ?\{/, `$&\n\ttemplate: \`\n${templateEscaped}\`,`)
    : `${script}\n export default {\n\ttemplate: \`\n${templateEscaped}\`};`;

  log.info('vue-loader', `Generated Vue module`);

  changeFilePathExtension(context);

  return scriptWithTemplate
}

/**
 * Change `filePath` extension to `.css` so that Portal may serve the resulting
 * CSS content.
 * @param {object} context
 */
function changeFilePathExtension(context) {
  let {filePath} = context;

  const extname = path.extname(filePath);

  if (extname == '') {
    filePath = `${filePath}.css`;
  } else {
    filePath = filePath.replace(new RegExp(`\\${extname}$`), '.js');
  }

  context.filePath = filePath;
}
