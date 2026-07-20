const student = {
  name: "ภานุพงษ์ ทองดี",
  studentId: "68543210016-0",
  os: process.platform,
  node: process.version,
};

function createGreeting({ name, studentId, os, node }) {
  return `Hello ${name} (${studentId}) | OS: ${os} | Node: ${node}`;
}

console.log(createGreeting(student));