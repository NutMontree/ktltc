const http = require('http');
http.get('http://localhost:3000/api/users/all', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const users = JSON.parse(data).users;
    console.log("Total users:", users.length);
    console.log("Sample user:", users.find(u => u.name && u.name.includes('ณัช')));
  });
});
