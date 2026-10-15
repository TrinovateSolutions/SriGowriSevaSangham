fetch("headerMain.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;
  });