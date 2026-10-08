const fs = require('fs');
const files = ['src/context/PharmacyContext.tsx', 'src/context/AuthContext.tsx'];
files.forEach(f => {
  let s = fs.readFileSync(f, 'utf8');
  s = s.split('\\`').join('`');
  s = s.split('\\$').join('$');
  fs.writeFileSync(f, s);
});
