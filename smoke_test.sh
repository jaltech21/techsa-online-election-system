#!/usr/bin/env bash
set -e
BASE="http://localhost:3001/api/v1"
P() { python3 -c "import sys,json; d=json.load(sys.stdin); $1"; }
STUDENT_ID="STU$(date +%s)"

echo "=== 1. Admin login ==="
ADMIN_TOKEN=$(curl -sf -X POST "$BASE/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme123!"}' | P "print(d['token'])")
echo "  OK — token: ${ADMIN_TOKEN:0:20}..."

echo "=== 2. Create election ==="
ELECTION_ID=$(curl -sf -X POST "$BASE/admin/elections" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"title":"President 2026","description":"Vote!"}' | P "print(d['id'])")
echo "  OK — election id: $ELECTION_ID"

echo "=== 3. Generate registration key ==="
KEY=$(curl -sf -X POST "$BASE/admin/elections/$ELECTION_ID/registration_keys/generate" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"count":1}' | P "print(d[0]['token'])")
echo "  OK — key: $KEY"

echo "=== 4. Register candidate with key ==="
CANDIDATE_ID=$(curl -sf -X POST "$BASE/candidates/register" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$KEY\",\"name\":\"Alice Smith\",\"position\":\"President\",\"bio\":\"I will lead us forward.\"}" \
  | P "print(d['id'])")
echo "  OK — candidate id: $CANDIDATE_ID"

echo "=== 5. Register a student ==="
STUDENT_TOKEN=$(curl -sf -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"student_id\":\"$STUDENT_ID\",\"name\":\"Bob Jones\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}" \
  | P "print(d['token'])")
echo "  OK — student token: ${STUDENT_TOKEN:0:20}..."

echo "=== 6. Try to vote (election is draft — should fail) ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/elections/$ELECTION_ID/votes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"candidate_id\":$CANDIDATE_ID}")
echo "  Expected 403, got: $STATUS"
[ "$STATUS" = "403" ] && echo "  OK" || echo "  FAIL"

echo "=== 7. Admin opens election ==="
NEW_STATUS=$(curl -sf -X PATCH "$BASE/admin/elections/$ELECTION_ID/toggle_status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | P "print(d['status'])")
echo "  OK — status: $NEW_STATUS"

echo "=== 8. Cast vote (should succeed) ==="
MSG=$(curl -sf -X POST "$BASE/elections/$ELECTION_ID/votes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"candidate_id\":$CANDIDATE_ID}" | P "print(d['message'])")
echo "  OK — $MSG"

echo "=== 9. Double-vote attempt (should fail) ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/elections/$ELECTION_ID/votes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"candidate_id\":$CANDIDATE_ID}")
echo "  Expected 422, got: $STATUS"
[ "$STATUS" = "422" ] && echo "  OK" || echo "  FAIL"

echo "=== 10. Admin closes election and views results ==="
curl -sf -X PATCH "$BASE/admin/elections/$ELECTION_ID/toggle_status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
VOTES=$(curl -sf "$BASE/elections/$ELECTION_ID" | P "print(d['results'][0]['votes'])")
echo "  OK — Alice has $VOTES vote(s)"

echo "=== 11. View live analytics ==="
TURNOUT=$(curl -sf "$BASE/admin/elections/$ELECTION_ID/analytics" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | P "print(d['votes_cast'])")
echo "  OK — votes_cast: $TURNOUT"

echo ""
echo "✅ All API smoke tests passed."
