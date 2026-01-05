#!/bin/bash

echo "================================================"
echo "JSDoc/TypeDoc Documentation Check"
echo "================================================"
echo ""

# Check if TypeDoc is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Generate TypeDoc
echo "📝 Generating TypeDoc documentation..."
npm run docs > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ TypeDoc documentation generated successfully"
    echo "   Location: ./docs/index.html"
else
    echo "❌ TypeDoc generation failed"
    exit 1
fi

echo ""
echo "📋 Checking JSDoc comments with ESLint..."
echo ""

# Run ESLint with JSDoc rules and count warnings
JSDOC_WARNINGS=$(npm run lint 2>&1 | grep "jsdoc/" | wc -l)
TOTAL_WARNINGS=$(npm run lint 2>&1 | grep "warning" | wc -l)

echo "   JSDoc warnings: $JSDOC_WARNINGS"
echo "   Total warnings: $TOTAL_WARNINGS"

if [ $JSDOC_WARNINGS -gt 0 ]; then
    echo ""
    echo "⚠️  Found $JSDOC_WARNINGS JSDoc issues"
    echo ""
    echo "Top JSDoc issues:"
    npm run lint 2>&1 | grep "jsdoc/" | cut -d' ' -f5- | sort | uniq -c | sort -rn | head -10
else
    echo "✅ No JSDoc issues found"
fi

echo ""
echo "================================================"
echo "Documentation check complete!"
echo "================================================"
echo ""
echo "To view the documentation:"
echo "  1. Run: npm run docs:serve"
echo "  2. Or open: ./docs/index.html in your browser"
echo ""
