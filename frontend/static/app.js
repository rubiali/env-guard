/* ===============================
   Utils
================================ */

function showResult(data) {
  const pre = document.getElementById("result");
  if (!pre) return;

  pre.textContent = JSON.stringify(data, null, 2);
  pre.classList.remove("d-none");
}

/* ===============================
   Schema selector toggle
================================ */

const schemaSelect = document.getElementById("schemaSelect");
const customSchemaBlock = document.getElementById("customSchemaBlock");

if (schemaSelect && customSchemaBlock) {
  schemaSelect.addEventListener("change", () => {
    if (schemaSelect.value === "custom") {
      customSchemaBlock.classList.remove("d-none");
    } else {
      customSchemaBlock.classList.add("d-none");
    }
  });
}

/* ===============================
   VALIDATE FORM
================================ */

const validateForm = document.getElementById("validate-form");

if (validateForm) {
  validateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const envFile = document.getElementById("envFile").files[0];
    const schema = schemaSelect.value;
    const schemaFileInput = document.getElementById("schemaFile");

    if (!envFile) {
      alert("Please select a .env file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", envFile);

    let url = "/validate";

    if (schema === "custom") {
      const schemaFile = schemaFileInput.files[0];
      if (!schemaFile) {
        alert("Please upload a custom schema file.");
        return;
      }
      formData.append("schema_file", schemaFile);
    } else {
      url += `?schema=${schema}`;
    }

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    showResult(data);
  });
}

/* ===============================
   COMPARE FORM
================================ */

const compareForm = document.getElementById("compare-form");

if (compareForm) {
  compareForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const envA = document.getElementById("envA").files[0];
    const envB = document.getElementById("envB").files[0];
    const schema = schemaSelect.value;
    const schemaFileInput = document.getElementById("schemaFile");

    if (!envA || !envB) {
      alert("Please select both env files.");
      return;
    }

    const formData = new FormData();
    formData.append("env_a", envA);
    formData.append("env_b", envB);

    let url = "/compare";

    if (schema === "custom") {
      const schemaFile = schemaFileInput.files[0];
      if (!schemaFile) {
        alert("Please upload a custom schema file.");
        return;
      }
      formData.append("schema_file", schemaFile);
    } else {
      url += `?schema=${schema}`;
    }

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    showResult(data);
  });
}
