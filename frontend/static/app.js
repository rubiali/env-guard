const API_BASE = "";

function showResult(data) {
  const pre = document.getElementById("result");
  pre.textContent = JSON.stringify(data, null, 2);
  pre.classList.remove("d-none");
}

// VALIDATE
const validateForm = document.getElementById("validate-form");
if (validateForm) {
  validateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("envFile").files[0];
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/validate`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    showResult(data);
  });
}

// COMPARE
const compareForm = document.getElementById("compare-form");
if (compareForm) {
  compareForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const envA = document.getElementById("envA").files[0];
    const envB = document.getElementById("envB").files[0];

    const formData = new FormData();
    formData.append("env_a", envA);
    formData.append("env_b", envB);

    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    showResult(data);
  });
}
