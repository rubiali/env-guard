function showResult(data) {
  const pre = document.getElementById("result");
  pre.textContent = JSON.stringify(data, null, 2);
  pre.classList.remove("d-none");
}

/* --------- TOGGLE CUSTOM SCHEMA UI --------- */

const schemaSelect = document.getElementById("schemaSelect");
const customSchemaBlock = document.getElementById("customSchemaBlock");

if (schemaSelect) {
  schemaSelect.addEventListener("change", () => {
    if (schemaSelect.value === "custom") {
      customSchemaBlock.classList.remove("d-none");
    } else {
      customSchemaBlock.classList.add("d-none");
    }
  });
}

/* --------- VALIDATE FORM --------- */

const validateForm = document.getElementById("validate-form");

if (validateForm) {
  validateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const envFile = document.getElementById("envFile").files[0];
    const schema = schemaSelect.value;
    const schemaFileInput = document.getElementById("schemaFile");

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
      body: formData
    });

    const data = await res.json();
    showResult(data);
  });
}
