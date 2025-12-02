const { shouldShowQuestion, evaluateCondition } = require('./conditional');

describe('conditional utils', () => {
    test('returns true when rules are null', () => {
        expect(shouldShowQuestion(null, {})).toBe(true);
    });

    test('equals operator works', () => {
        const rules = { logic: 'AND', conditions: [{ questionKey: 'a', operator: 'equals', value: 'x' }] };
        expect(shouldShowQuestion(rules, { a: 'x' })).toBe(true);
        expect(shouldShowQuestion(rules, { a: 'y' })).toBe(false);
    });

    test('notEquals operator works', () => {
        const rules = { logic: 'AND', conditions: [{ questionKey: 'a', operator: 'notEquals', value: 'x' }] };
        expect(shouldShowQuestion(rules, { a: 'y' })).toBe(true);
        expect(shouldShowQuestion(rules, { a: 'x' })).toBe(false);
    });

    test('contains operator for arrays and strings', () => {
        const rulesArr = { logic: 'AND', conditions: [{ questionKey: 'tags', operator: 'contains', value: 'foo' }] };
        expect(shouldShowQuestion(rulesArr, { tags: ['foo', 'bar'] })).toBe(true);
        expect(shouldShowQuestion(rulesArr, { tags: ['bar'] })).toBe(false);

        const rulesStr = { logic: 'AND', conditions: [{ questionKey: 's', operator: 'contains', value: 'lo' }] };
        expect(shouldShowQuestion(rulesStr, { s: 'hello' })).toBe(true);
        expect(shouldShowQuestion(rulesStr, { s: 'hey' })).toBe(false);
    });

    test('AND/OR combining logic', () => {
        const andRules = { logic: 'AND', conditions: [{ questionKey: 'a', operator: 'equals', value: 1 }, { questionKey: 'b', operator: 'equals', value: 2 }] };
        expect(shouldShowQuestion(andRules, { a: 1, b: 2 })).toBe(true);
        expect(shouldShowQuestion(andRules, { a: 1, b: 3 })).toBe(false);

        const orRules = { logic: 'OR', conditions: [{ questionKey: 'a', operator: 'equals', value: 1 }, { questionKey: 'b', operator: 'equals', value: 2 }] };
        expect(shouldShowQuestion(orRules, { a: 9, b: 2 })).toBe(true);
        expect(shouldShowQuestion(orRules, { a: 9, b: 8 })).toBe(false);
    });

    test('missing answers do not crash and evaluate to false for conditions', () => {
        const rules = { logic: 'AND', conditions: [{ questionKey: 'x', operator: 'equals', value: 'y' }] };
        expect(shouldShowQuestion(rules, {})).toBe(false);
    });
});
