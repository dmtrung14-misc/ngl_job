document.getElementById('reportButton').addEventListener('click', () => {
  const company = document.getElementById('repCompany').value.trim();
  const name = document.getElementById('repName').value.trim();
  const contact = document.getElementById('repContact').value.trim();
  const type = document.getElementById('repType').value; // "referrers" or "recruiters"
  if (!company || !name || !contact) {
    alert('Please fill all fields.');
    return;
  }
  const compRef = firebase.database().ref('companies/' + company + '/' + type);
  const entry = { name, contact };
  compRef.push(entry)
    .then(() => alert('Reported successfully.'))
    .catch(err => alert('Error reporting: ' + err.message));
});
