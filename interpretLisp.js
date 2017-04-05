// ***************** LISP INTERPRETER **************************************************
// This will be a Lisp Interpreter written in JavaScript
// Environment Objects are in environment.js module
// Data is pulled from lisp.txt
// ***************************************************************************************

var fs = require('fs')
var input1 = fs.readFileSync('/Users/MichaelFlynn/Apps/GS/lispjs/lisp.txt')
var lispFile = input1.toString()
var environment = require('/Users/MichaelFlynn/Apps/GS/lispjs/environment.js')

var lisp = parseLisp(lispFile)[0]
var stdEnv = environment.Env
var envG = stdEnv.globCon

console.log(interpLisp(lisp, envG))

// *******************************************************************************************
// Below is the Evaluation code of the Lisp Interpreter. The BRAIN.
// Single Function interpLisp with sub/inner Helper Functions
// *******************************************************************************************
function interpLisp (x, env) {
  if (envG['symbol?'](x)) {
    return findVar(x, env)[x]
  }
  if (!envG['list?'](x)) {
    return x
  }
  if (x[0] === 'print') {
    return runPrint(x, env)
  }
  if (x[0] === 'quote') {
    return runQuote(x, env)
  }
  if (x[0] === 'if') {
    return runIf(x, env)
  }
  if (x[0] === 'set!') {
    var [, params, ...args] = x
    return setVar(params, args, env)
  }
  if (x[0] === 'define') {
    return defineVar(x, env)
  }
  if (x[0] === 'lambda') {
    return buildProc(x, env)
  }
  return runProc(x, env)

  // Helper Functions for processing interpLisp
  function runPrint (x, env) {
    var [, exp] = x
    if (exp.length === 1) {
      console.log(env[exp])
      return 'print'
    }
    console.log(runProc(exp, env))
    return 'print'
  }

  function runQuote (x, env) {
    var [, exp] = x
    console.log(exp.join(' '))
    return 'quote'
  }

  function runIf (x, env) {
    var [, test, conseq, alt] = x
    if (interpLisp(test, env)) {
      return interpLisp(conseq, env)
    }
    return interpLisp(alt, env)
  }

  function setVar (params, args, env) {
    for (var i = 0; i < params.length; i++) {
      env[params[i]] = interpLisp(args[i], env)
    }
    // console.log('Set: ' + params + '-->' + args)
    return env
  }

  function defineVar (x, env) {
    var [, params, args] = x
    env[params] = interpLisp(args, env)
    return env
  }

  function buildProc (x, env) {
    stdEnv.globCon.contextCnt = stdEnv.globCon.contextCnt + 1
    stdEnv['funCon' + stdEnv.globCon.contextCnt] = {
      parEnv: env['curEnv'],
      curEnv: 'stdEnv.funCon' + stdEnv.globCon.contextCnt
    }
    var monkPatch = stdEnv['funCon' + stdEnv.globCon.contextCnt]
    if (env['parEnv'] !== null) {
      var [, params, body, ...args] = x
      var lambda = function (...args) { return interpLisp(body, setVar(params, args, monkPatch)) }
      // console.log('Func: ' + params + '-->' + body + '-->' + args)
      return lambda(...args)
    }
    var [, params, body] = x
    stdEnv.globCon['lambda' + stdEnv.globCon.contextCnt] = function (...args) { return interpLisp(body, setVar(params, args, monkPatch)) }
    // console.log('Glob: ' + params + '-->' + body)
    return 'lambda' + stdEnv.globCon.contextCnt
  }

  function runProc (x, env) {
    var proc = interpLisp(x[0], env)
    var args = []
    for (var i = 1; i < x.length; i++) {
      args.push(interpLisp(x[i], env))
    }
    // console.log('Run: ' + proc + '-->' + args)
    return envG[proc](...args)
  }

  function findVar (x, env) {
    if (env['parEnv'] === null) {
      return envG
    }
    if (env[x] !== undefined) {
      // console.log('In Env: ' + x + ' Cur--> ' + env.curEnv + ' Par--> ' + env.parEnv)
      return env
    }
    return findVar(x, eval(env['parEnv']))
  }
}

// *******************************************************************************************
// Below is the aggregate parser for Lisp input, It will call the required primitive parsers
// *******************************************************************************************

function parseLisp (str) {
  var parserArr = [parseSpace, parseNum, parseParen, parseChar]
  for (var i = 0; i < parserArr.length; i++) {
    var result = parserArr[i](str)
    if (result !== null) {
      return result
    }
  }
}

// *******************************************************************************************
// Below are the basic parser functions that can be called independently or through parseValue
// *******************************************************************************************
function parseSpace (str) {
  var spaceVal = /^\s+/
  if (spaceVal.test(str)) {
    return [spaceVal.exec(str)[0], str.replace(spaceVal.exec(str)[0], '')]
  }
  return null
}

function parseNum (str) {
  var numVal = /^\d+/
  if (numVal.test(str)) {
    return [Number(numVal.exec(str)[0]), str.replace(numVal.exec(str)[0], '')]
  }
  return null
}

function parseChar (str) {
  var charVal = /^\S+/.exec(str)
  var spaceVal = /\s+/.exec(str)
  var idxSpc = 0
  var idxPar = 0
  if (charVal !== null) {
    idxSpc = spaceVal.index
    idxPar = str.indexOf(')')
    if (idxSpc < idxPar && idxSpc > 0) {
      return [str.slice(0, idxSpc), str.slice(idxSpc + 1)]
    }
    if (idxSpc > idxPar && idxPar > 0) {
      return [str.slice(0, idxPar), str.slice(idxPar)]
    }
  }
  return null
}

// Paren Parser that builds an Array
function parseParen (str) {
  if (str.charAt(0) !== '(') {
    return null
  }
  var arr = []
  str = str.slice(1)
  while (str.charAt(0) !== ')') {
    str = checkSpace(str)
    var [value, rest] = parseLisp(str)
    if (value !== undefined) {
      arr.push(value)
      str = rest
      str = checkSpace(str)
    }
  }
  return [arr, str.slice(1)]
}

function checkSpace (str) {
  var tmpSpc = parseSpace(str)
  if (tmpSpc !== null) {
    return tmpSpc[1]
  }
  return str
}
