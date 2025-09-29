// Calculator service for handling math expressions
export class CalculatorService {
  private static isMathExpression(query: string): boolean {
    // Check if query contains math operators or functions
    const mathPattern = /^[\d\s+\-*/().^√πe\s]+$|^(sqrt|sin|cos|tan|log|ln|abs|ceil|floor|round)\s*\(/i;
    return mathPattern.test(query.trim());
  }

  private static evaluateExpression(expression: string): number | string {
    try {
      // Clean and normalize the expression
      let cleanExpr = expression.trim();
      
      // Replace common math symbols
      cleanExpr = cleanExpr.replace(/×/g, '*');
      cleanExpr = cleanExpr.replace(/÷/g, '/');
      cleanExpr = cleanExpr.replace(/π/g, 'Math.PI');
      cleanExpr = cleanExpr.replace(/e/g, 'Math.E');
      cleanExpr = cleanExpr.replace(/√/g, 'Math.sqrt');
      cleanExpr = cleanExpr.replace(/\^/g, '**');
      
      // Handle common functions
      cleanExpr = cleanExpr.replace(/sqrt\(/g, 'Math.sqrt(');
      cleanExpr = cleanExpr.replace(/sin\(/g, 'Math.sin(');
      cleanExpr = cleanExpr.replace(/cos\(/g, 'Math.cos(');
      cleanExpr = cleanExpr.replace(/tan\(/g, 'Math.tan(');
      cleanExpr = cleanExpr.replace(/log\(/g, 'Math.log10(');
      cleanExpr = cleanExpr.replace(/ln\(/g, 'Math.log(');
      cleanExpr = cleanExpr.replace(/abs\(/g, 'Math.abs(');
      cleanExpr = cleanExpr.replace(/ceil\(/g, 'Math.ceil(');
      cleanExpr = cleanExpr.replace(/floor\(/g, 'Math.floor(');
      cleanExpr = cleanExpr.replace(/round\(/g, 'Math.round(');
      
      // Evaluate the expression safely
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${cleanExpr})`)();
      
      // Format the result
      if (typeof result === 'number') {
        if (Number.isInteger(result)) {
          return result.toString();
        } else {
          return parseFloat(result.toFixed(10)).toString();
        }
      }
      
      return result.toString();
    } catch (error) {
      return 'Invalid expression';
    }
  }

  private static formatResult(result: number | string): string {
    if (typeof result === 'string' && result === 'Invalid expression') {
      return result;
    }
    
    const num = typeof result === 'number' ? result : parseFloat(result);
    
    if (isNaN(num)) {
      return 'Invalid expression';
    }
    
    // Format large numbers
    if (Math.abs(num) >= 1e12) {
      return num.toExponential(6);
    }
    
    // Format small numbers
    if (Math.abs(num) < 0.001 && num !== 0) {
      return num.toExponential(6);
    }
    
    // Format regular numbers
    if (Number.isInteger(num)) {
      return num.toLocaleString();
    } else {
      return parseFloat(num.toFixed(10)).toLocaleString();
    }
  }

  static calculate(query: string): { isMath: boolean; result?: string; expression?: string } {
    if (!this.isMathExpression(query)) {
      return { isMath: false };
    }

    const result = this.evaluateExpression(query);
    const formattedResult = this.formatResult(result);
    
    return {
      isMath: true,
      result: formattedResult,
      expression: query.trim()
    };
  }

  static getMathSuggestions(query: string): string[] {
    const suggestions = [
      '2 + 2',
      'sqrt(16)',
      'sin(90)',
      'log(100)',
      '2^3',
      'π * 2',
      'abs(-5)',
      'ceil(4.2)',
      'floor(4.8)',
      'round(4.6)'
    ];

    if (!query.trim()) {
      return suggestions.slice(0, 5);
    }

    // Filter suggestions based on query
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }
}
