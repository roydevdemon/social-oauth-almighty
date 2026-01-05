#!/bin/bash

echo "================================================"
echo "Pre-publish Checklist"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: package.json validation
echo "1️⃣  Checking package.json..."
if [ -f "package.json" ]; then
    # Check if version is not 0.0.1
    VERSION=$(node -p "require('./package.json').version")
    if [ "$VERSION" = "0.0.1" ]; then
        echo -e "${YELLOW}⚠️  Warning: Version is still 0.0.1${NC}"
        echo "   Consider updating version before publishing"
    else
        echo -e "${GREEN}✅ Version: $VERSION${NC}"
    fi

    # Check required fields
    for field in name version description main types license; do
        VALUE=$(node -p "require('./package.json').$field || ''")
        if [ -z "$VALUE" ]; then
            echo -e "${RED}❌ Missing required field: $field${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
else
    echo -e "${RED}❌ package.json not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check 2: Build files exist
echo "2️⃣  Checking build files..."
if [ -d "build" ]; then
    FILE_COUNT=$(find build -type f -name "*.js" | wc -l)
    if [ $FILE_COUNT -gt 0 ]; then
        echo -e "${GREEN}✅ Build directory exists with $FILE_COUNT JS files${NC}"
    else
        echo -e "${RED}❌ Build directory is empty${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Build directory not found. Run 'npm run build' first${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check for .d.ts files
DTS_COUNT=$(find build -type f -name "*.d.ts" 2>/dev/null | wc -l)
if [ $DTS_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Type definitions found ($DTS_COUNT files)${NC}"
else
    echo -e "${RED}❌ No type definitions found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check 3: Required files
echo "3️⃣  Checking required files..."
for file in README.md LICENSE; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check 4: Test status
echo "4️⃣  Running tests..."
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passing${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check 5: Lint status
echo "5️⃣  Running linter..."
npm run lint > /dev/null 2>&1
LINT_EXIT=$?
if [ $LINT_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ No linting errors${NC}"
else
    ERROR_COUNT=$(npm run lint 2>&1 | grep "error" | wc -l)
    WARNING_COUNT=$(npm run lint 2>&1 | grep "warning" | wc -l)
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "${RED}❌ $ERROR_COUNT linting errors found${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${YELLOW}⚠️  $WARNING_COUNT warnings (no errors)${NC}"
    fi
fi

echo ""

# Check 6: Package size
echo "6️⃣  Checking package size..."
if command -v npm &> /dev/null; then
    # Create a dry-run pack
    npm pack --dry-run > /tmp/npm-pack-dry-run.txt 2>&1

    # Get package size
    PACKAGE_NAME=$(node -p "require('./package.json').name + '-' + require('./package.json').version + '.tgz'")
    if npm pack > /dev/null 2>&1; then
        if [ -f "$PACKAGE_NAME" ]; then
            SIZE=$(ls -lh "$PACKAGE_NAME" | awk '{print $5}')
            echo -e "${GREEN}✅ Package size: $SIZE${NC}"

            # Show what will be published
            echo ""
            echo "📦 Files to be published:"
            tar -tzf "$PACKAGE_NAME" | head -20

            FILE_COUNT=$(tar -tzf "$PACKAGE_NAME" | wc -l)
            if [ $FILE_COUNT -gt 20 ]; then
                echo "   ... and $((FILE_COUNT - 20)) more files"
            fi

            # Clean up
            rm "$PACKAGE_NAME"
        fi
    fi
fi

echo ""
echo "================================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to publish.${NC}"
    echo ""
    echo "To publish:"
    echo "  1. Update version: npm version patch|minor|major"
    echo "  2. Publish: npm publish"
    echo ""
    echo "Or use: npm version patch && npm publish"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please fix before publishing.${NC}"
    exit 1
fi
