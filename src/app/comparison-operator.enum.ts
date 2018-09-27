export enum ComparisonOperator {
    None,
    GreaterThan,
    LessThan
}

export function parseComparisonOperator(text: string): ComparisonOperator {
    switch (text) {
        case ')':
        case 'v':
            return ComparisonOperator.GreaterThan;
        case '(':
        case '^':
            return ComparisonOperator.LessThan;
        default:
            return ComparisonOperator.None;
    }
}

export function reverseOperator(operator: ComparisonOperator): ComparisonOperator {
    switch (operator) {
        case ComparisonOperator.GreaterThan:
            return ComparisonOperator.LessThan;
        case ComparisonOperator.LessThan:
            return ComparisonOperator.GreaterThan;
        default:
            return operator;
    }
}
