// *******************************************************************************************
// Below are "HELPER" Functions and Environment Objects for the Lisp Interpreter
// *******************************************************************************************

module.exports = {
  getEnv: function () {
    var stdEnv = {
      globCon: {
        '+': 'add',
        '-': 'sub',
        '*': 'mul',
        '/': 'div',
        '>': 'gt',
        '<': 'lt',
        '>=': 'ge',
        '<=': 'le',
        '=': 'eq',
        abs: 'absFunc',
        append: 'add',
        apply: 'function',
        begin: 'begFunc',
        car: 'carFunc',
        cdr: 'cdrFunc',
        cons: 'consFunc',
        list: 'listFunc',
        map: 'mapFunc',
        max: 'maxFunc',
        min: 'minFunc',
        round: 'roundFunc',
        pi: Math.PI,
        not: '!',
        'eq?': function (x, y) { return x === y },
        'equal?': function (x, y) { return x === y },
        length: function (x) { return x.length },
        'list?': function (x) { return stdEnv.realTypeOf(x) === 'Array' },
        'null?': function (x) { return stdEnv.realTypeOf(x) === 'Null' },
        'number?': function (x) { return stdEnv.realTypeOf(x) === 'Number' },
        'procedure?': function (x) { return stdEnv.realTypeOf(x) === 'Function' },
        'symbol?': function (x) { return /^\S*[^\d]/.test(x) && stdEnv.realTypeOf(x) !== 'Array' },
        add: function (...args) { var a = args; return a.reduce(function (e1, e2) { return e1 + e2 }) },
        sub: function (...args) { var a = args; return a.reduce(function (e1, e2) { return e1 - e2 }) },
        mul: function (...args) { var a = args; return a.reduce(function (e1, e2) { return e1 * e2 }) },
        div: function (x, y) { return x / y },
        gt: function (x, y) { return x > y },
        lt: function (x, y) { return x < y },
        ge: function (x, y) { return x >= y },
        le: function (x, y) { return x <= y },
        eq: function (x, y) { return x === y },
        absFunc: function (x) { return Math.abs(x) },
        begFunc: function (...args) { var a = args; return a[a.length - 1] },
        carFunc: function (...args) { var a = args; return a[0] },
        cdrFunc: function (...args) { var a = args; a.shift(); return a },
        consFunc: function (x, y) { x.push(y); return x },
        listFunc: function (...args) { var a = args; return a },
        mapFunc: function (func, iter) { return iter.map(func) },
        maxFunc: function (...args) { return Math.max(...args) },
        minFunc: function (...args) { return Math.min(...args) },
        roundFunc: function (x) { return Math.round(x) },
        conCnt: 0,
        parEnv: null,
        curEnv: 'stdEnv.globCon'
      },
      realTypeOf: function (obj) {
        return Object.prototype.toString.call(obj).slice(8, -1)
      }
    }
    return stdEnv
  }
}