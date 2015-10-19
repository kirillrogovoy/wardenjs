require('babel/register')({
  blacklist: [
    'es6.blockScoping',
    'es6.constants',
    'es6.classes',
    'regenerator',
    'es6.properties.shorthand',
    'es6.arrowFunctions',
    'es6.templateLiterals'
  ]
});
