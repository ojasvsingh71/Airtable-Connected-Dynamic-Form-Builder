function evaluateCondition(condition, answers) {
    const { questionKey, operator, value } = condition;
    const actual = answers ? answers[questionKey] : undefined;
    if (operator === 'equals') return actual === value;
    if (operator === 'notEquals') return actual !== value;
    if (operator === 'contains') {
        if (actual === undefined || actual === null) return false;
        if (Array.isArray(actual)) return actual.includes(value);
        if (typeof actual === 'string') return actual.includes(String(value));
        return false;
    }
    return false;
}


function shouldShowQuestion(rules, answersSoFar) {
    if (!rules) return true;
    const logic = (rules.logic || 'AND').toUpperCase();
    const conds = Array.isArray(rules.conditions) ? rules.conditions : [];
    if (conds.length === 0) return true;
    const results = conds.map(c => {
        try {
            return evaluateCondition(c, answersSoFar);
        } catch (e) {
            return false;
        }
    });
    if (logic === 'AND') return results.every(Boolean);
    if (logic === 'OR') return results.some(Boolean);
    return false;
}


module.exports = { shouldShowQuestion, evaluateCondition };