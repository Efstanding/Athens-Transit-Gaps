#!/usr/bin/env node
// validate.js — checks data/gaps.json against data/schema.json
// Usage: node validate.js

const fs = require('fs');
const path = require('path');

const gaps = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/gaps.json'), 'utf8'));

const errors = [];
const ids = new Set();

const VALID_LINES = ['M1', 'M2', 'M3', 'TRAM', 'BUS', 'ISAP', 'PROAST'];
const VALID_GAP_TYPES = ['elevator', 'alt-route', 'exit-only', 'fare-free', 'unstaffed', 'other'];
const VALID_SEVERITIES = ['high', 'med', 'low'];
const VALID_STATUSES = ['active', 'patched', 'unverified'];
const VALID_STAFF = ['always', 'sometimes', 'rarely', 'never', null];
const ID_PATTERN = /^(M1|M2|M3|TRAM|BUS|ISAP|PROAST)-[A-Z]{2,6}-\d{3}$/;

gaps.forEach((entry, i) => {
  const loc = `Entry #${i + 1} (${entry.id || 'NO ID'})`;

  if (!entry.id) errors.push(`${loc}: missing 'id'`);
  else if (!ID_PATTERN.test(entry.id)) errors.push(`${loc}: invalid id format '${entry.id}'`);
  else if (ids.has(entry.id)) errors.push(`${loc}: duplicate id '${entry.id}'`);
  else ids.add(entry.id);

  if (!entry.station) errors.push(`${loc}: missing 'station'`);
  if (!entry.station_en) errors.push(`${loc}: missing 'station_en'`);

  if (!Array.isArray(entry.lines) || entry.lines.length === 0)
    errors.push(`${loc}: 'lines' must be a non-empty array`);
  else entry.lines.forEach(l => {
    if (!VALID_LINES.includes(l)) errors.push(`${loc}: invalid line '${l}'`);
  });

  if (!VALID_GAP_TYPES.includes(entry.gap_type))
    errors.push(`${loc}: invalid gap_type '${entry.gap_type}'`);
  if (!VALID_SEVERITIES.includes(entry.severity))
    errors.push(`${loc}: invalid severity '${entry.severity}'`);
  if (!VALID_STATUSES.includes(entry.status))
    errors.push(`${loc}: invalid status '${entry.status}'`);
  if (!VALID_STAFF.includes(entry.staff_presence))
    errors.push(`${loc}: invalid staff_presence '${entry.staff_presence}'`);

  if (!entry.title) errors.push(`${loc}: missing 'title'`);
  if (!entry.description) errors.push(`${loc}: missing 'description'`);
  if (!entry.entry_point) errors.push(`${loc}: missing 'entry_point'`);
  if (!entry.destination) errors.push(`${loc}: missing 'destination'`);
});

if (errors.length === 0) {
  console.log(`✓ All ${gaps.length} entries valid.`);
  process.exit(0);
} else {
  console.error(`✗ ${errors.length} error(s) found:\n`);
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}
