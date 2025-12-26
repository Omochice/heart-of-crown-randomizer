#!/bin/bash

# Script to verify that build output is correct.
# This checks that:
# 1. Type definition file (.d.mts) exists
# 2. JavaScript module file (.mjs) exists
# 3. All expected exports are present in both files

set -e

DIST_DIR="dist"
TYPE_DEF_FILE="$DIST_DIR/index.d.mts"
MODULE_FILE="$DIST_DIR/index.mjs"

EXPECTED_EXPORTS=(
    "createRNG"
    "shuffle"
    "filter"
    "filterByIds"
    "select"
    "validateConstraints"
    "ConstraintConflictError"
    "Constraint"
    "Predicate"
    "SelectOptions"
    "Identifiable"
)

# Runtime exports (functions and classes, not types)
RUNTIME_EXPORTS=(
    "createRNG"
    "shuffle"
    "filter"
    "filterByIds"
    "select"
    "validateConstraints"
    "ConstraintConflictError"
)

echo "🔍 Verifying build output..."
echo

# Check files exist
if [ ! -f "$TYPE_DEF_FILE" ]; then
    echo "❌ File not found: $TYPE_DEF_FILE"
    exit 1
fi
echo "✅ File exists: $TYPE_DEF_FILE"

if [ ! -f "$MODULE_FILE" ]; then
    echo "❌ File not found: $MODULE_FILE"
    exit 1
fi
echo "✅ File exists: $MODULE_FILE"

echo

# Check exports in type definition file
MISSING_EXPORTS=0
for export_name in "${EXPECTED_EXPORTS[@]}"; do
    if ! grep -q "$export_name" "$TYPE_DEF_FILE"; then
        echo "❌ Export not found in $TYPE_DEF_FILE: $export_name"
        MISSING_EXPORTS=1
    fi
done

if [ $MISSING_EXPORTS -eq 0 ]; then
    echo "✅ All ${#EXPECTED_EXPORTS[@]} exports found in $TYPE_DEF_FILE"
else
    exit 1
fi

# Check exports in module file (only runtime exports)
MISSING_EXPORTS=0
for export_name in "${RUNTIME_EXPORTS[@]}"; do
    if ! grep -q "$export_name" "$MODULE_FILE"; then
        echo "❌ Export not found in $MODULE_FILE: $export_name"
        MISSING_EXPORTS=1
    fi
done

if [ $MISSING_EXPORTS -eq 0 ]; then
    echo "✅ All ${#RUNTIME_EXPORTS[@]} runtime exports found in $MODULE_FILE"
else
    exit 1
fi

echo
echo "✅ Build verification passed!"
