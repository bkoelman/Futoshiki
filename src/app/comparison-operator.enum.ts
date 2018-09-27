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
