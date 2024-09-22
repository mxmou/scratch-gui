module.exports = {
    rules: {
        'no-console': 'off',
        'no-constant-condition': ['error', {
            checkLoops: false
        }],
        'no-empty': 'off',
        'no-loop-func': 'off',

        // Override some Scratch rules:

        // Best practices
        'block-scoped-var': 'off',
        'eqeqeq': 'off',
        'no-else-return': 'off',
        'no-multi-spaces': 'off',
        'no-throw-literal': 'off',
        'radix': 'off',

        // Variables
        'no-shadow': 'off',
        'no-undefined': 'off',
        'no-use-before-define': 'off',

        // Style
        'brace-style': ['error', '1tbs', {
            allowSingleLine: true
        }],
        'comma-dangle': ['error', 'always-multiline'],
        'func-style': 'off',
        'indent': ['error', 2, {
            ignoredNodes: [
                'VariableDeclaration',
                'IfStatement > .test',
                'ForStatement > .init',
                'ForStatement > .test',
                'ForStatement > .update',
                'ConditionalExpression',
                'CallExpression',
                'ArrayExpression',
                'MemberExpression'
            ],
            ignoreComments: true,
            SwitchCase: 1
        }],
        'key-spacing': ['error', {
            beforeColon: false,
            afterColon: true,
            mode: 'minimum'
        }],
        'newline-per-chained-call': 'off',
        'no-lonely-if': 'off',
        'no-mixed-operators': 'off',
        'no-multiple-empty-lines': 'off',
        'no-negated-condition': 'off',
        'one-var': 'off',
        'operator-linebreak': 'off',
        'quote-props': 'off',
        'quotes': 'off',
        'require-jsdoc': 'off',
        'space-before-function-paren': ['error', 'never'],
        'spaced-comment': 'off',

        // ES6
        'no-var': 'off',
        'prefer-arrow-callback': 'off',
        'prefer-rest-params': 'off',
        'prefer-spread': 'off',
        'prefer-template': 'off',

        // Imports
        'import/no-mutable-exports': 'off'
    }
};
