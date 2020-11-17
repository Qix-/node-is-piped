#!/usr/bin/env node
const isPiped = require('.');
console.error(isPiped);
console.error('stdin (in):', isPiped.in(0));
console.error('stdout (in):', isPiped.in(1));
console.error('stdin (out):', isPiped.out(0));
console.error('stdout (out):', isPiped.out(1));
